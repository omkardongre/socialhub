import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRestService } from '../external/user/user.rest.service';
import { MediaRestService } from '../external/media/media.rest.service';
import { HttpModule } from '@nestjs/axios';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, HttpModule, RabbitMQModule, AuthModule],
  providers: [PostsService, UserRestService, MediaRestService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
