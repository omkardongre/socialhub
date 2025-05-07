import { Test, TestingModule } from '@nestjs/testing';
import { FollowersController } from './followers.controller';
import { FollowersService } from './followers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';

// Mock the service
const mockFollowersService = {
  followUser: jest.fn(),
  unfollowUser: jest.fn(),
  getFollowers: jest.fn(),
  getFollowing: jest.fn(),
};

// Mock request object with user
const mockRequest = (userId: string) => ({
  user: { userId },
});

describe('FollowersController', () => {
  let controller: FollowersController;
  let service: FollowersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowersController],
      providers: [
        {
          provide: FollowersService,
          useValue: mockFollowersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Mock the guard
      .useValue({ canActivate: () => true }) // Allow access
      .compile();

    controller = module.get<FollowersController>(FollowersController);
    service = module.get<FollowersService>(FollowersService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Tests for follow ---
  describe('follow', () => {
    it('should call followersService.followUser and return success', async () => {
      const req = mockRequest('user1');
      const targetUserId = 'user2';
      const mockResult = { id: 'follow1', followerId: 'user1', followingId: 'user2', createdAt: new Date() };
      mockFollowersService.followUser.mockResolvedValue(mockResult);

      const response = await controller.follow(req, targetUserId);

      expect(service.followUser).toHaveBeenCalledWith(req.user.userId, targetUserId);
      expect(response).toEqual({
        success: true,
        data: mockResult,
        message: 'Successfully followed user',
      });
    });

    it('should handle errors from service', async () => {
        const req = mockRequest('user1');
        const targetUserId = 'user1'; // Trying to follow self
        const error = new BadRequestException("Can't follow yourself");
        mockFollowersService.followUser.mockRejectedValue(error);

        await expect(controller.follow(req, targetUserId)).rejects.toThrow(BadRequestException);
        expect(service.followUser).toHaveBeenCalledWith(req.user.userId, targetUserId);
    });

  });

  // --- Tests for unfollow ---
  describe('unfollow', () => {
    it('should call followersService.unfollowUser and return success', async () => {
      const req = mockRequest('user1');
      const targetUserId = 'user2';
      const mockResult = { count: 1 }; // Prisma result for deleteMany
      mockFollowersService.unfollowUser.mockResolvedValue(mockResult);

      const response = await controller.unfollow(req, targetUserId);

      expect(service.unfollowUser).toHaveBeenCalledWith(req.user.userId, targetUserId);
      expect(response).toEqual({
        success: true,
        data: mockResult,
        message: 'Successfully unfollowed user',
      });
    });
  });

  // --- Tests for getFollowers ---
  describe('getFollowers', () => {
    it('should call followersService.getFollowers and return the list', async () => {
      const req = mockRequest('user1');
      const mockFollowersList = [{ followerId: 'user3' }, { followerId: 'user4' }];
      mockFollowersService.getFollowers.mockResolvedValue(mockFollowersList);

      const response = await controller.getFollowers(req);

      expect(service.getFollowers).toHaveBeenCalledWith(req.user.userId);
      expect(response).toEqual({
        success: true,
        data: mockFollowersList,
        message: 'Followers retrieved successfully',
      });
    });
  });

  // --- Tests for getFollowing ---
  describe('getFollowing', () => {
    it('should call followersService.getFollowing and return the list', async () => {
      const req = mockRequest('user1');
      const mockFollowingList = [{ followingId: 'user5' }, { followingId: 'user6' }];
      mockFollowersService.getFollowing.mockResolvedValue(mockFollowingList);

      const response = await controller.getFollowing(req);

      expect(service.getFollowing).toHaveBeenCalledWith(req.user.userId);
      expect(response).toEqual({
        success: true,
        data: mockFollowingList,
        message: 'Following list retrieved successfully',
      });
    });
  });
});
