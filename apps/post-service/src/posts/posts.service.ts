import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikePostDto } from './dto/like-post.dto';
import { UserRestService } from 'src/external/user/user.rest.service';
import { MediaRestService } from 'src/external/media/media.rest.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private userRestService: UserRestService,
    private mediaRestService: MediaRestService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        userId: createPostDto.userId,
        content: createPostDto.content,
        mediaUrl: undefined,
      },
    });

    if (createPostDto.mediaId) {
      const media = await this.mediaRestService.associateMediaToPost(
        createPostDto.mediaId,
        post.id,
      );
      await this.prisma.post.update({
        where: { id: post.id },
        data: { mediaUrl: media.url },
      });
    }

    return post;
  }

  findByUser(userId: string) {
    return this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addComment(postId: string, dto: CreateCommentDto) {
    return await this.prisma.comment.create({
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

  async getFeed(userId: string, pagination: { limit: number; offset: number }) {
    const followingUsers = await this.userRestService.getFollowing(userId);
    const followedIds = followingUsers.map((u: any) => u.id || u);

    return this.prisma.post.findMany({
      where: { userId: { in: followedIds } },
      orderBy: { createdAt: 'desc' },
      skip: pagination.offset,
      take: pagination.limit,
      include: { comments: true, likes: true },
    });
  }

  async getPostWithAuthor(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const authorProfile = await this.userRestService.getUserProfile(
      post.userId,
    );

    return {
      ...post,
      author: authorProfile,
    };
  }
}
