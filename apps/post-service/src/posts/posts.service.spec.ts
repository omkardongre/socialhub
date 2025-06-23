import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRestService } from '../external/user/user.rest.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikePostDto } from './dto/like-post.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

// Mock data and services
const mockPrismaService = {
  post: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  comment: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  like: {
    create: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockUserRestService = {
  getFollowing: jest.fn(),
  getUserProfile: jest.fn(),
};

const mockRabbitMQService = {
  // Add any RabbitMQ service methods that PostsService uses
  emit: jest.fn(),
  send: jest.fn(),
};

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UserRestService, useValue: mockUserRestService },
        { provide: 'RABBITMQ_SERVICE', useValue: mockRabbitMQService },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a post without media', async () => {
      const createPostDto: CreatePostDto = {
        userId: 'user1',
        content: 'Test post',
      };
      const post = { id: 'post1', ...createPostDto, createdAt: new Date() };
      mockPrismaService.post.create.mockResolvedValue(post);

      const result = await service.create(createPostDto);
      expect(result).toEqual(post);
      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: {
          userId: createPostDto.userId,
          content: createPostDto.content,
          mediaUrl: createPostDto.mediaUrl,
        },
      });
      expect(mockRabbitMQService.emit).toHaveBeenCalled();
    });

    it('should create a post with media', async () => {
      const createPostDto: CreatePostDto = {
        userId: 'user1',
        content: 'Test post with media',
        mediaUrl: 'http://example.com/media.jpg',
      };
      const post = { id: 'post1', ...createPostDto, createdAt: new Date() };
      mockPrismaService.post.create.mockResolvedValue(post);

      const result = await service.create(createPostDto);
      expect(result).toEqual(post);
      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: {
          userId: createPostDto.userId,
          content: createPostDto.content,
          mediaUrl: createPostDto.mediaUrl,
        },
      });
      expect(mockRabbitMQService.emit).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return posts for a user', async () => {
      const userId = 'user1';
      const posts = [{ id: 'post1', userId, content: 'Test post' }];
      mockPrismaService.post.findMany.mockResolvedValue(posts);

      const result = await service.findByUser(userId);
      expect(result).toEqual(posts);
      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('addComment', () => {
    it('should add a comment to a post', async () => {
      const postId = 'post1';
      const createCommentDto: CreateCommentDto = {
        userId: 'user1',
        content: 'Test comment',
      };
      const comment = { id: 'comment1', postId, ...createCommentDto };
      mockPrismaService.comment.create.mockResolvedValue(comment);

      const result = await service.addComment(postId, createCommentDto);
      expect(result).toEqual(comment);
      expect(mockPrismaService.comment.create).toHaveBeenCalledWith({
        data: { postId, ...createCommentDto },
      });
    });
  });

  describe('likePost', () => {
    it('should like a post', async () => {
      const postId = 'post1';
      const likePostDto: LikePostDto = { userId: 'user1' };
      const like = { id: 'like1', postId, ...likePostDto };
      mockPrismaService.like.create.mockResolvedValue(like);

      const result = await service.likePost(postId, likePostDto);
      expect(result).toEqual(like);
      expect(mockPrismaService.like.create).toHaveBeenCalledWith({
        data: { postId, ...likePostDto },
      });
    });

    it('should throw ConflictException if post is already liked', async () => {
      const postId = 'post1';
      const likePostDto: LikePostDto = { userId: 'user1' };
      mockPrismaService.like.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.likePost(postId, likePostDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getPostWithAuthor', () => {
    const postId = 'post1';
    const post = { id: postId, userId: 'user1', content: 'Hello' };
    const authorProfile = { id: 'user1', name: 'Test User' };

    it('should return post with author profile', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(post);
      mockUserRestService.getUserProfile.mockResolvedValue(authorProfile);

      const authHeader = 'Bearer test-token';
      const result = await service.getPostWithAuthor(postId, authHeader);

      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({ where: { id: postId } });
      expect(mockUserRestService.getUserProfile).toHaveBeenCalledWith(post.userId, authHeader);
      expect(result).toEqual({ ...post, author: authorProfile });
    });

    it('should throw NotFoundException if post not found', async () => {
      const authHeader = 'Bearer test-token';
      mockPrismaService.post.findUnique.mockResolvedValue(null);
      await expect(service.getPostWithAuthor(postId, authHeader)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getPostWithAuthor(postId, authHeader)).rejects.toThrow(
        'Post not found',
      );
    });
  });
});
