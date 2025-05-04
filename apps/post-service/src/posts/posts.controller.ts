import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikePostDto } from './dto/like-post.dto';

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

  @Post(':id/comments')
  addComment(@Param('id') postId: string, @Body() dto: CreateCommentDto) {
    return this.postsService.addComment(postId, dto);
  }

  @Post(':id/like')
  likePost(@Param('id') postId: string, @Body() dto: LikePostDto) {
    return this.postsService.likePost(postId, dto);
  }

  @Get(':id/interactions')
  getInteractions(@Param('id') postId: string) {
    return this.postsService.getPostInteractions(postId);
  }

  @Get('ping')
  ping() {
    return { message: 'Post Service is live!' };
  }
}
