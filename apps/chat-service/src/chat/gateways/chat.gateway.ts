import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import {
  Logger,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MessagesService } from '../services/chat.service';
import { CreateMessageDto } from '../dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    try {
      this.logger.log(`Client connected: ${client.id}`);
    } catch (error) {
      this.logger.error(`Error in handleConnection: ${error}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    try {
      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error(`Error in handleDisconnect: ${error}`);
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

      await client.join(data.roomId);
      this.logger.log(`Client ${client.id} joined room ${data.roomId}`);

      this.server.to(data.roomId).emit('user_joined', {
        userId: client.id,
        roomId: data.roomId,
        timestamp: new Date().toISOString(),
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
      if (!client.rooms.has(createMessageDto.roomId)) {
        throw new BadRequestException(
          'You must join the room before sending messages',
        );
      }

      const message = await this.messagesService.createMessage({
        roomId: createMessageDto.roomId,
        senderId: createMessageDto.senderId,
        content: createMessageDto.content,
      });

      this.server.to(createMessageDto.roomId).emit('receive_message', {
        id: message.id,
        roomId: message.roomId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      });

      return {
        success: true,
        message: 'Message sent successfully',
        data: {
          messageId: message.id,
          timestamp: message.createdAt,
        },
      };
    } catch (error) {
      const errorMessage =
        error.response?.message || error.message || 'Failed to send message';
      this.logger.error(`Error sending message: ${errorMessage}`, error.stack);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to send message');
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

      await client.leave(data.roomId);
      this.logger.log(`Client ${client.id} left room ${data.roomId}`);

      this.server.to(data.roomId).emit('user_left', {
        userId: client.id,
        roomId: data.roomId,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: `Left room ${data.roomId}`,
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
