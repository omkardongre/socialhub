import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket as BaseSocket, Server } from 'socket.io';
import {
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ChatService } from '../chat.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';
import { verifyWsClientToken } from '../../ws-auth/ws-auth.util';
import * as cookie from 'cookie';

// Extend the Socket interface to include our custom properties
interface CustomSocket extends BaseSocket {
  user?: {
    id: string;
    email?: string;
    [key: string]: any;
  };
}

// Use our custom socket type
type Socket = CustomSocket;

import { env } from '../../env';

@WebSocketGateway({
  cors: {
    origin: env.API_GATEWAY || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);
  private readonly activeRooms = new Map<string, Set<string>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Get token from query params
      const roomId = client.handshake.query?.roomId as string;

      const cookieHeader = client.handshake.headers.cookie;
      const cookies = cookie.parse(cookieHeader || '');
      const token = cookies.token;

      if (!token) {
        throw new WsException('No token provided');
      }

      // Verify the token and get user payload
      const payload = await verifyWsClientToken(client, this.jwtService);

      client.user = {
        id: payload.sub,
        email: payload.email,
        ...payload,
      };

      if (!client.user) {
        throw new WsException('User not authenticated');
      }

      this.logger.log(`User ${client.user.id} connected via socket.`);

      if (!roomId) {
        throw new WsException('Missing room ID');
      }

      // Join the room in Socket.IO
      await client.join(roomId);

      // Track in database
      await this.chatService.joinRoom(roomId, client.user.id);

      // Track active users in memory
      if (!this.activeRooms.has(roomId)) {
        this.activeRooms.set(roomId, new Set());
      }
      this.activeRooms.get(roomId)?.add(client.user.id);

      // Mark messages as read for this user
      await this.chatService.markMessagesAsRead(roomId, client.user.id);

      // Get all participants to send presence info
      const participants = await this.chatService.getRoomParticipants(roomId);

      // Notify room about new user with participant list
      this.server.to(roomId).emit('user_joined', {
        userId: client.user.id,
        roomId,
        participants: participants.map((p) => ({
          userId: p.userId,
          lastSeen: p.lastSeen,
          isOnline: this.activeRooms.get(roomId)?.has(p.userId) || false,
        })),
      });

      this.logger.log(
        `Client ${client.id} (User: ${client.user.id}) connected to room ${roomId}`,
      );
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`, error.stack);
      client.emit('connection_error', {
        message: error.message || 'Connection failed',
      });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const roomId = client.handshake.query?.roomId as string;
      const userId = client.user?.id;

      if (!userId || !roomId) {
        this.logger.warn(
          `Disconnect - Missing user or room ID for client: ${client.id}`,
        );
        return;
      }

      // Update last seen in database
      await this.chatService.leaveRoom(roomId, userId);

      // Update in-memory tracking
      const roomUsers = this.activeRooms.get(roomId);
      if (roomUsers) {
        roomUsers.delete(userId);
        if (roomUsers.size === 0) {
          this.activeRooms.delete(roomId);
        } else {
          // Notify room about user leaving
          this.server.to(roomId).emit('user_left', {
            userId,
            roomId,
            timestamp: new Date().toISOString(),
            participants: Array.from(roomUsers),
          });
        }
      }

      this.logger.log(
        `Client ${client.id} (User: ${userId}) disconnected from room ${roomId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error in handleDisconnect: ${error.message}`,
        error.stack,
      );
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!data?.roomId) {
        throw new BadRequestException('Room ID is required');
      }

      if (!client.user) {
        throw new BadRequestException('User not authenticated');
      }

      // Join the room in database
      await this.chatService.joinRoom(data.roomId, client.user.id);

      // Join the room in Socket.IO
      await client.join(data.roomId);

      // Update in-memory tracking
      if (!this.activeRooms.has(data.roomId)) {
        this.activeRooms.set(data.roomId, new Set());
      }
      this.activeRooms.get(data.roomId)?.add(client.user.id);

      // Mark messages as read
      await this.chatService.markMessagesAsRead(data.roomId, client.user.id);

      // Get all participants
      const participants = await this.chatService.getRoomParticipants(
        data.roomId,
      );

      // Notify room
      this.server.to(data.roomId).emit('user_joined', {
        userId: client.user.id,
        roomId: data.roomId,
        timestamp: new Date().toISOString(),
        participants: participants.map((p) => ({
          userId: p.userId,
          lastSeen: p.lastSeen,
          isOnline: this.activeRooms.get(data.roomId)?.has(p.userId) || false,
        })),
      });

      return {
        success: true,
        message: `Joined room ${data.roomId}`,
      };
    } catch (error) {
      const errorMessage =
        error.response?.message || error.message || 'Failed to join room';
      this.logger.error(`Error joining room: ${errorMessage}`, error.stack);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to join room');
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!client.user) {
        throw new BadRequestException('User not authenticated');
      }

      const userId = client.user.id;
      const { roomId, content } = createMessageDto;

      if (!content?.trim()) {
        throw new BadRequestException('Message content cannot be empty');
      }

      // Verify user is in the room they're trying to message
      if (!client.rooms.has(roomId)) {
        throw new BadRequestException(
          'You must join the room before sending messages',
        );
      }

      const roomUsers = this.activeRooms.get(roomId);
      if (!roomUsers?.has(userId)) {
        throw new BadRequestException('Not a member of this room');
      }

      // Save message to database
      const message = await this.chatService.createMessage({
        ...createMessageDto,
        senderId: userId,
      });

      // Broadcast to all clients in the room including sender
      const messageResponse = {
        id: message.id,
        roomId: message.roomId,
        senderId: message.senderId,
        content: message.content,
        mediaUrl: message.mediaUrl,
        createdAt: message.createdAt.toISOString(),
      };

      this.server.to(roomId).emit('receive_message', messageResponse);
      this.logger.debug(`Message ${message.id} broadcasted to room ${roomId}`);

      return {
        success: true,
        message: 'Message sent successfully',
        data: messageResponse,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      const errorCode = error instanceof BadRequestException ? 400 : 500;

      this.logger.error(`Error handling message: ${errorMessage}`, errorStack);

      // Send error back to the client
      client.emit('message_error', {
        error: errorMessage,
        code: errorCode,
      });

      // Re-throw for NestJS to handle
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!data?.roomId) {
        throw new BadRequestException('Room ID is required');
      }

      if (!client.user) {
        throw new BadRequestException('User not authenticated');
      }

      const userId = client.user.id;
      const roomId = data.roomId;

      // Update last seen in database
      await this.chatService.leaveRoom(roomId, userId);

      // Leave the room in Socket.IO
      await client.leave(roomId);

      // Update in-memory tracking
      const roomUsers = this.activeRooms.get(roomId);
      if (roomUsers) {
        roomUsers.delete(userId);
        if (roomUsers.size === 0) {
          this.activeRooms.delete(roomId);
        }
      }

      // Notify room
      this.server.to(roomId).emit('user_left', {
        userId,
        roomId,
        timestamp: new Date().toISOString(),
        participants: Array.from(roomUsers || []),
      });

      return {
        success: true,
        message: `Left room ${roomId}`,
      };
    } catch (error) {
      const errorMessage =
        error.response?.message || error.message || 'Failed to leave room';
      this.logger.error(`Error leaving room: ${errorMessage}`, error.stack);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to leave room');
    }
  }
}
