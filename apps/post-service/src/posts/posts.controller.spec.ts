import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikePostDto } from './dto/like-post.dto';
import { FeedQueryDto } from './dto/feed-query.dto';

// Mock PostsService
const mockPostsService = {
  create: jest.fn(),
  findByUser: jest.fn(),
  addComment: jest.fn(),
  likePost: jest.fn(),
  getPostInteractions: jest.fn(),
  getFeed: jest.fn(),
};

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post and return it', async () => {
      const createPostDto: CreatePostDto = {
        content: 'Test Content',
      };
      const mockReq = { user: { userId: 'user1' } };
      const mockPost = {
        id: 'post1',
        userId: 'user1',
        content: 'Test Content',
        createdAt: new Date(),
      };
      mockPostsService.create.mockResolvedValue(mockPost);

      const result = await controller.create(createPostDto, mockReq as any);

      expect(service.create).toHaveBeenCalledWith({
        ...createPostDto,
        userId: 'user1',
      });
      expect(result).toEqual({
        success: true,
        data: mockPost,
        message: 'Post created successfully',
      });
    });
  });

  describe('findByUser', () => {
    it('should find posts by user ID and return them', async () => {
      const userId = 'user1';
      const mockPosts = [{ id: 'post1', userId, content: 'Test Content' }];
      mockPostsService.findByUser.mockResolvedValue(mockPosts);

      const result = await controller.findByUser(userId);

      expect(service.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        success: true,
        data: mockPosts,
        message: 'User posts retrieved successfully',
      });
    });
  });

  describe('addComment', () => {
    it('should add a comment to a post and return it', async () => {
      const postId = 'post1';
      const createCommentDto: CreateCommentDto = {
        userId: 'user1',
        content: 'Test Comment',
      };
      const mockComment = {
        id: 'comment1',
        postId,
        ...createCommentDto,
      };
      mockPostsService.addComment.mockResolvedValue(mockComment);

      const result = await controller.addComment(postId, createCommentDto);

      expect(service.addComment).toHaveBeenCalledWith(postId, createCommentDto);
      expect(result).toEqual({
        success: true,
        data: mockComment,
        message: 'Comment added successfully',
      });
    });
  });

  describe('likePost', () => {
    it('should like a post and return the result', async () => {
      const postId = 'post1';
      const likePostDto: LikePostDto = { userId: 'user1' };
      const mockLikeResult = { liked: true, likesCount: 1 }; // Example result
      mockPostsService.likePost.mockResolvedValue(mockLikeResult);

      const result = await controller.likePost(postId, likePostDto);

      expect(service.likePost).toHaveBeenCalledWith(postId, likePostDto);
      expect(result).toEqual({
        success: true,
        data: mockLikeResult,
        message: 'Post liked successfully',
      });
    });
  });

  describe('getPostInteractions', () => {
    it('should get post interactions and return them', async () => {
      const postId = 'post1';
      const mockInteractions = { likes: 5, comments: 2 }; // Example result
      mockPostsService.getPostInteractions.mockResolvedValue(mockInteractions);

      const result = await controller.getInteractions(postId);

      expect(service.getPostInteractions).toHaveBeenCalledWith(postId);
      expect(result).toEqual({
        success: true,
        data: mockInteractions,
        message: 'Post interactions retrieved successfully',
      });
    });
  });

  describe('getFeed', () => {
    it('should get the feed for a user and return it', async () => {
      const mockReq = {
        user: { userId: 'user1' },
        headers: { authorization: 'Bearer test-token' },
      } as any;
      const query: FeedQueryDto = { limit: '10', offset: '0' };
      const expectedFeedData = [{ id: 'post1', content: 'Feed post' }];
      mockPostsService.getFeed.mockResolvedValue(expectedFeedData);

      const result = await controller.getFeed(mockReq, query);

      expect(service.getFeed).toHaveBeenCalledWith(
        'user1',
        {
          limit: 10,
          offset: 0,
        },
        'Bearer test-token',
      );
      expect(result).toEqual({
        success: true,
        data: expectedFeedData,
        message: 'Feed retrieved successfully',
      });
    });

    it('should use default limit and offset if not provided in query', async () => {
      const mockReq = {
        user: { userId: 'user1' },
        headers: { authorization: 'Bearer test-token' },
      } as any;
      const query: FeedQueryDto = {}; // Empty query
      const expectedFeedData = [{ id: 'post2', content: 'Another feed post' }];
      mockPostsService.getFeed.mockResolvedValue(expectedFeedData);

      const result = await controller.getFeed(mockReq, query);

      expect(service.getFeed).toHaveBeenCalledWith(
        'user1',
        {
          limit: 10,
          offset: 0,
        },
        'Bearer test-token',
      ); // Expect defaults
      expect(result).toEqual({
        success: true,
        data: expectedFeedData,
        message: 'Feed retrieved successfully',
      });
    });
  });

  describe('ping', () => {
    it('should return a success message', () => {
      const result = controller.ping();
      expect(result).toEqual({
        success: true,
        data: null,
        message: 'Post Service is live!',
      });
    });
  });
});
