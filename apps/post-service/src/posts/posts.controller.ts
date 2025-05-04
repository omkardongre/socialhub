import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get('user/:id')
  findByUser(@Param('id') userId: string) {
    return this.postsService.findByUser(userId);
  }

  @Get('ping')
  ping() {
    return { message: 'Post Service is live!' };
  }
}
