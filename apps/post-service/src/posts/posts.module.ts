import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [HttpModule],
  providers: [PostsService, PrismaService],
  controllers: [PostsController],
})
export class PostsModule {}
