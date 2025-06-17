import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { UserRestService } from './external/user/user.rest.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PostsModule, CommentsModule, LikesModule, HttpModule],
  controllers: [AppController],
  providers: [AppService, UserRestService],
})
export class AppModule {}
