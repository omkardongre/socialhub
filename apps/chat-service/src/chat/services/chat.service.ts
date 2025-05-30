import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(createMessageDto: {
    roomId: string;
    senderId: string;
    content: string;
  }) {
    return this.prisma.message.create({
      data: {
        roomId: createMessageDto.roomId,
        senderId: createMessageDto.senderId,
        content: createMessageDto.content,
      },
      include: {
        room: true,
      },
    });
  }
}
