import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './chat.service';
import { ChatRoomController } from './chat-room.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ChatRoomController],
  providers: [
    ChatGateway,
    ChatService,
    PrismaService,
    JwtService,
    ConfigService,
  ],
})
export class ChatModule {}
