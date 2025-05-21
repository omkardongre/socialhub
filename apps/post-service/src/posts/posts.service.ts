import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikePostDto } from './dto/like-post.dto';
import { UserRestService } from 'src/external/user/user.rest.service';
import { MediaRestService } from 'src/external/media/media.rest.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private userRestService: UserRestService,
    private mediaRestService: MediaRestService,
    @Inject('RABBITMQ_SERVICE') private rabbitmqClient: ClientProxy,
  ) {}

  async create(createPostDto: CreatePostDto) {
    // Check if user exists by trying to get their profile
    try {
      await this.userRestService.getUserProfile(createPostDto.userId);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new ConflictException(
        `User with id ${createPostDto.userId} does not exist: ${errorMessage}`,
      );
    }

    // If mediaId is provided, we'll try to associate it later
    // The association will fail if the media doesn't exist

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

      if (!media?.url) {
        throw new Error('Failed to get media URL from media service');
      }

      await this.prisma.post.update({
        where: { id: post.id },
        data: { mediaUrl: media.url },
      });

      // Update the post object with the new media URL
      post.mediaUrl = media.url;
    }

    // Emit post_created event
    const postEvent = {
      postId: post.id,
      userId: post.userId,
      content: post.content,
      mediaUrl: post.mediaUrl || null,
      createdAt: post.createdAt.toISOString(),
    } as const;
    this.rabbitmqClient.emit('post_created', postEvent);

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
    const followedIds = followingUsers
      .map((user: { id: string } | string) => {
        return typeof user === 'string' ? user : user.id;
      })
      .filter((id): id is string => Boolean(id));

    return this.prisma.post.findMany({
      where: { userId: { in: followedIds } },
      orderBy: { createdAt: 'desc' },
      skip: pagination.offset,
      take: pagination.limit,
      include: { comments: true, likes: true },
    });
  }

  async getPostWithAuthor(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    try {
      const authorProfile = await this.userRestService.getUserProfile(
        post.userId,
      );

      return {
        ...post,
        author: authorProfile,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch author profile';
      throw new NotFoundException(`Error fetching author: ${errorMessage}`);
    }
  }
}
