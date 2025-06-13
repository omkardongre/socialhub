import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { ChatController } from './chat.controller';
import { UserRestService } from '../external/user.rest.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    PrismaService,
    JwtService,
    UserRestService,
  ],
})
export class ChatModule {}
