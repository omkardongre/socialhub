import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikePostDto } from './dto/like-post.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    const post = await this.postsService.create(createPostDto);
    return {
      success: true,
      data: post,
      message: 'Post created successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  async findByUser(@Param('id') userId: string) {
    const posts = await this.postsService.findByUser(userId);
    return {
      success: true,
      data: posts,
      message: 'User posts retrieved successfully',
    };
  }

  @Post(':id/comments')
  async addComment(@Param('id') postId: string, @Body() dto: CreateCommentDto) {
    const comment = await this.postsService.addComment(postId, dto);
    return {
      success: true,
      data: comment,
      message: 'Comment added successfully',
    };
  }

  @Post(':id/like')
  async likePost(@Param('id') postId: string, @Body() dto: LikePostDto) {
    const result = await this.postsService.likePost(postId, dto);
    return {
      success: true,
      data: result,
      message: 'Post liked successfully',
    };
  }

  @Get(':id/interactions')
  async getInteractions(@Param('id') postId: string) {
    const interactions = await this.postsService.getPostInteractions(postId);
    return {
      success: true,
      data: interactions,
      message: 'Post interactions retrieved successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/feed')
  async getFeed(@Req() req, @Query() query: FeedQueryDto) {
    const userId = req.user.userId;
    const feed = await this.postsService.getFeed(userId, {
      limit: Number(query.limit) || 10,
      offset: Number(query.offset) || 0,
    });
    return {
      success: true,
      data: feed,
      message: 'Feed retrieved successfully',
    };
  }

  @Get('ping')
  ping() {
    return {
      success: true,
      data: null,
      message: 'Post Service is live!',
    };
  }
}
