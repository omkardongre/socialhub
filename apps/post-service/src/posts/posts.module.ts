import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRestService } from '../external/user/user.rest.service';
import { MediaRestService } from '../external/media/media.rest.service';
import { HttpModule } from '@nestjs/axios';
import { EventBusModule } from '@app/event-bus';

@Module({
  imports: [PrismaModule, HttpModule, EventBusModule],
  providers: [PostsService, UserRestService, MediaRestService],
  controllers: [PostsController],
})
export class PostsModule {}
