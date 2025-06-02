import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRestService } from '../external/user/user.rest.service';
import { MediaRestService } from '../external/media/media.rest.service';
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

const mockMediaRestService = {
  associateMediaToPost: jest.fn(),
};

const mockRabbitMQService = {
  // Add any RabbitMQ service methods that PostsService uses
  emit: jest.fn(),
  send: jest.fn(),
};

describe('PostsService', () => {
  let service: PostsService;
  // let prisma: PrismaService; // Unused
  // let userRestService: UserRestService; // Unused
  // let mediaRestService: MediaRestService; // Unused

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UserRestService, useValue: mockUserRestService },
        { provide: MediaRestService, useValue: mockMediaRestService },
        { provide: 'RABBITMQ_SERVICE', useValue: mockRabbitMQService },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    // prisma = module.get<PrismaService>(PrismaService); // Unused
    // userRestService = module.get<UserRestService>(UserRestService); // Unused
    // mediaRestService = module.get<MediaRestService>(MediaRestService); // Unused
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createPostDto: CreatePostDto = {
      userId: 'user1',
      content: 'Test Post',
    };
    const createdPost = {
      id: 'post1',
      ...createPostDto,
      mediaUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a post without mediaId', async () => {
      mockPrismaService.post.create.mockResolvedValue(createdPost);
      const result = await service.create(createPostDto);
      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: { userId: 'user1', content: 'Test Post', mediaUrl: undefined },
      });
      expect(mockMediaRestService.associateMediaToPost).not.toHaveBeenCalled();
      expect(mockPrismaService.post.update).not.toHaveBeenCalled();
      expect(result).toEqual(createdPost);
    });

    it('should create a post with mediaId and associate media', async () => {
      const dtoWithMedia: CreatePostDto = {
        ...createPostDto,
        mediaId: 'media1',
      };
      const mediaInfo = { id: 'media1', url: 'http://example.com/media.jpg' };
      mockPrismaService.post.create.mockResolvedValue(createdPost); // Initial creation
      mockMediaRestService.associateMediaToPost.mockResolvedValue(mediaInfo);
      mockPrismaService.post.update.mockResolvedValue({
        ...createdPost,
        mediaUrl: mediaInfo.url,
      }); // Mock update call as well

      const result = await service.create(dtoWithMedia);

      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: { userId: 'user1', content: 'Test Post', mediaUrl: undefined },
      });
      expect(mockMediaRestService.associateMediaToPost).toHaveBeenCalledWith(
        'media1',
        createdPost.id,
      );
      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: createdPost.id },
        data: { mediaUrl: mediaInfo.url },
      });
      // The service currently returns the initially created post, not the updated one from prisma.post.update.
      // If the intention is to return the post with the mediaUrl, the service logic might need adjustment or this test needs to reflect the current behavior.
      expect(result).toEqual(createdPost);
    });
  });

  describe('findByUser', () => {
    it('should find posts by userId', async () => {
      const userId = 'user1';
      const posts = [{ id: 'post1', userId, content: 'Test' }];
      mockPrismaService.post.findMany.mockResolvedValue(posts);
      const result = await service.findByUser(userId);
      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({ where: { userId }, orderBy: { createdAt: 'desc' } });
      expect(result).toEqual(posts);
    });
  });

  describe('addComment', () => {
    it('should add a comment to a post', async () => {
      const postId = 'post1';
      const dto: CreateCommentDto = { userId: 'user1', content: 'Nice post!' };
      const comment = { id: 'comment1', postId, ...dto };
      mockPrismaService.comment.create.mockResolvedValue(comment);
      const result = await service.addComment(postId, dto);
      expect(mockPrismaService.comment.create).toHaveBeenCalledWith({ data: { postId, userId: dto.userId, content: dto.content } });
      expect(result).toEqual(comment);
    });
  });

  describe('likePost', () => {
    const postId = 'post1';
    const dto: LikePostDto = { userId: 'user1' };
    const like = { id: 'like1', postId, userId: dto.userId };

    it('should allow a user to like a post', async () => {
      mockPrismaService.like.create.mockResolvedValue(like);
      const result = await service.likePost(postId, dto);
      expect(mockPrismaService.like.create).toHaveBeenCalledWith({ data: { postId, userId: dto.userId } });
      expect(result).toEqual(like);
    });

    it('should throw ConflictException if user already liked the post', async () => {
      mockPrismaService.like.create.mockRejectedValue({ code: 'P2002' });
      await expect(service.likePost(postId, dto)).rejects.toThrow(ConflictException);
      await expect(service.likePost(postId, dto)).rejects.toThrow('User already liked this post');
    });

    it('should rethrow other errors', async () => {
      const otherError = new Error('Some other database error');
      mockPrismaService.like.create.mockRejectedValue(otherError);
      await expect(service.likePost(postId, dto)).rejects.toThrow(otherError);
    });
  });

  describe('getPostInteractions', () => {
    it('should get comments and likes count for a post', async () => {
      const postId = 'post1';
      const comments = [{ id: 'c1', content: 'Comment 1' }];
      const likesCount = 5;
      mockPrismaService.$transaction.mockResolvedValue([comments, likesCount]);

      const result = await service.getPostInteractions(postId);

      expect(mockPrismaService.$transaction).toHaveBeenCalledWith([
        mockPrismaService.comment.findMany({ where: { postId } }),
        mockPrismaService.like.count({ where: { postId } }),
      ]);
      expect(result).toEqual({ comments, likesCount });
    });
  });

  describe('getFeed', () => {
    it('should retrieve a feed for the user based on followed users', async () => {
      const userId = 'user1';
      const pagination = { limit: 10, offset: 0 };
      const followingUsers = [{ id: 'user2' }, { id: 'user3' }];
      const followedIds = ['user2', 'user3'];
      const posts = [{ id: 'post1', userId: 'user2' }];

      mockUserRestService.getFollowing.mockResolvedValue(followingUsers);
      mockPrismaService.post.findMany.mockResolvedValue(posts);

      const result = await service.getFeed(userId, pagination);

      expect(mockUserRestService.getFollowing).toHaveBeenCalledWith(userId);
      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
        where: { userId: { in: followedIds } },
        orderBy: { createdAt: 'desc' },
        skip: pagination.offset,
        take: pagination.limit,
        include: { comments: true, likes: true },
      });
      expect(result).toEqual(posts);
    });
  });

  describe('getPostWithAuthor', () => {
    const postId = 'post1';
    const post = { id: postId, userId: 'user1', content: 'Hello' };
    const authorProfile = { id: 'user1', name: 'Test User' };

    it('should return post with author profile', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(post);
      mockUserRestService.getUserProfile.mockResolvedValue(authorProfile);

      const result = await service.getPostWithAuthor(postId);

      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({ where: { id: postId } });
      expect(mockUserRestService.getUserProfile).toHaveBeenCalledWith(post.userId);
      expect(result).toEqual({ ...post, author: authorProfile });
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);
      await expect(service.getPostWithAuthor(postId)).rejects.toThrow(NotFoundException);
      await expect(service.getPostWithAuthor(postId)).rejects.toThrow('Post not found');
    });
  });
});
