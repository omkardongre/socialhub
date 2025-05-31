import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createMessage(createMessageDto: CreateMessageDto) {
    try {
      await this.prisma.chatRoom.upsert({
        where: { id: createMessageDto.roomId },
        create: { id: createMessageDto.roomId },
        update: {},
      });

      this.logger.log(
        `Saving message in room ${createMessageDto.roomId} from user ${createMessageDto.senderId}`,
      );

      const message = await this.prisma.message.create({
        data: {
          roomId: createMessageDto.roomId,
          senderId: createMessageDto.senderId,
          content: createMessageDto.content,
          mediaUrl: createMessageDto.mediaUrl || null,
        },
      });

      this.logger.debug(`Message ${message.id} saved successfully`);
      return message;
    } catch (error) {
      this.logger.error('Failed to save message', {
        error: error instanceof Error ? error.message : 'Unknown error',
        roomId: createMessageDto.roomId,
        senderId: createMessageDto.senderId,
      });
      throw new Error('Failed to save message');
    }
  }

  async joinRoom(roomId: string, userId: string) {
    try {
      // Ensure room exists
      await this.prisma.chatRoom.upsert({
        where: { id: roomId },
        create: { id: roomId },
        update: {},
      });

      // Create or update participant
      return await this.prisma.chatParticipant.upsert({
        where: {
          roomId_userId: { roomId, userId },
        },
        create: {
          roomId,
          userId,
          lastSeen: new Date(),
        },
        update: {
          lastSeen: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`, error.stack);
      throw new Error('Failed to join room');
    }
  }

  async leaveRoom(roomId: string, userId: string) {
    try {
      await this.prisma.chatParticipant.updateMany({
        where: { roomId, userId },
        data: { lastSeen: new Date() },
      });
    } catch (error) {
      this.logger.error(`Error leaving room: ${error.message}`, error.stack);
      // Don't throw error on leave to prevent disconnection issues
    }
  }

  async getRoomParticipants(roomId: string) {
    return this.prisma.chatParticipant.findMany({
      where: { roomId },
    });
  }

  async markMessagesAsRead(roomId: string, userId: string) {
    return this.prisma.message.updateMany({
      where: {
        roomId,
        senderId: { not: userId }, // Messages not from this user
        // Add any additional conditions for unread messages
      },
      data: { isRead: true },
    });
  }
}
