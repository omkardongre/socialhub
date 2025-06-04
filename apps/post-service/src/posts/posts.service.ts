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
import { UserRestService } from '../external/user/user.rest.service';
import { MediaRestService } from '../external/media/media.rest.service';
import { ClientProxy } from '@nestjs/microservices';
import { createPostCreatedEvent } from '@libs/events';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private userRestService: UserRestService,
    private mediaRestService: MediaRestService,
    @Inject('RABBITMQ_SERVICE') private rabbitmqClient: ClientProxy,
  ) {}

  async create(createPostDto: CreatePostDto, authHeader: string) {
    if (!createPostDto.userId) {
      throw new ConflictException('User ID is required');
    }
    await this.userRestService.getUserProfile(createPostDto.userId, authHeader);

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
    const postEvent = createPostCreatedEvent({
      postId: post.id,
      userId: post.userId,
      content: post.content,
      mediaUrl: post.mediaUrl || undefined,
      createdAt: post.createdAt.toISOString(),
    });
    this.rabbitmqClient.emit(postEvent.event, postEvent);

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
      // Only catch and rethrow known business exceptions
      if (error?.code === 'P2002') {
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

  async getFeed(
    userId: string,
    pagination: { limit: number; offset: number },
    authHeader: string,
  ) {
    const followingUsers = await this.userRestService.getFollowing(
      userId,
      authHeader,
    );
    const followedIds = followingUsers.map((follower) => follower.followedId);
    followedIds.push(userId);

    const posts = await this.prisma.post.findMany({
      where: { userId: { in: followedIds } },
      orderBy: { createdAt: 'desc' },
      skip: pagination.offset,
      take: pagination.limit,
      include: { comments: true, likes: true },
    });

    // Fetch all user profiles in parallel and cache by userId
    const userProfilesMap = new Map<string, any>();
    await Promise.all(
      Array.from(new Set(posts.map((post) => post.userId))).map(async (uid) => {
        try {
          const profile = await this.userRestService.getUserProfile(
            uid,
            authHeader,
          );
          userProfilesMap.set(uid, profile);
        } catch {
          userProfilesMap.set(uid, null);
        }
      }),
    );

    // Attach user profile to each post
    const postsWithUser = posts.map((post) => {
      const userResp = userProfilesMap.get(post.userId);
      return {
        ...post,
        user: userResp && userResp.success ? userResp.data : null,
      };
    });

    return postsWithUser;
  }

  async getPostWithAuthor(postId: string, authHeader: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const authorProfile = await this.userRestService.getUserProfile(
      post.userId,
      authHeader,
    );

    return {
      ...post,
      author: authorProfile,
    };
  }
}
