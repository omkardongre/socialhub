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
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);
    this.logger.log(`Client ${client.id} joined room ${data.roomId}`);

    client.to(data.roomId).emit('user_joined', {
      userId: client.id,
      roomId: data.roomId,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('send_message')
  handleSendMessage(
    @MessageBody()
    message: {
      roomId: string;
      senderId: string;
      content: string;
      timestamp: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Message from ${message.senderId} in room ${message.roomId}: ${message.content}`,
    );

    client.to(message.roomId).emit('receive_message', {
      ...message,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.roomId);
    this.logger.log(`Client ${client.id} left room ${data.roomId}`);
  }
}
