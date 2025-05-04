import { Injectable, ConflictException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikePostDto } from './dto/like-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  create(createPostDto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        ...createPostDto,
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addComment(postId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        postId,
        userId: dto.userId,
        content: dto.content,
      },
    });
  }

  async likePost(postId: string, dto: LikePostDto) {
    try {
      return await this.prisma.like.create({
        data: {
          postId,
          userId: dto.userId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('User already liked this post');
      }
      throw error;
    }
  }

  async getPostInteractions(postId: string) {
    const [comments, likes] = await this.prisma.$transaction([
      this.prisma.comment.findMany({ where: { postId } }),
      this.prisma.like.count({ where: { postId } }),
    ]);
    return { comments, likesCount: likes };
  }
}
