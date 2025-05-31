import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  providers: [
    ChatGateway,
    ChatService,
    PrismaService,
    JwtService,
    ConfigService,
  ],
})
export class ChatModule {}
