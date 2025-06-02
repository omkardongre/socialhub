import { Test, TestingModule } from '@nestjs/testing';
import { FollowersService } from './followers.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

// NOTE: Removed jest.mock('../prisma/prisma.service') to allow manual deep mocking below.

describe('FollowersService', () => {
  let service: FollowersService;
  let prisma: jest.Mocked<PrismaService>;

  const mockFollowerRelation = {
    id: 'follow1',
    followerId: 'user1',
    followingId: 'user2',
    createdAt: new Date(),
  };

  const mockFollowerList = [
    {
      ...mockFollowerRelation,
      id: 'f1',
      followerId: 'user3',
      follower: { id: 'user3', name: 'Follower 3' },
    }, // Include mock follower data
    {
      ...mockFollowerRelation,
      id: 'f2',
      followerId: 'user4',
      follower: { id: 'user4', name: 'Follower 4' },
    }, // Include mock follower data
  ];

  const mockFollowingList = [
    {
      ...mockFollowerRelation,
      id: 'f1',
      followerId: 'user3',
      followingId: 'user2',
      follower: { id: 'user3', name: 'Follower 3' },
    },
    {
      ...mockFollowerRelation,
      id: 'f2',
      followerId: 'user4',
      followingId: 'user2',
      follower: { id: 'user4', name: 'Follower 4' },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowersService,
        PrismaService,
        {
          provide: 'RABBITMQ_SERVICE',
          useValue: { emit: jest.fn(), send: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<FollowersService>(FollowersService);
    // Inject the mocked PrismaService
    prisma = module.get(PrismaService);

    // --- Ensure the nested structure exists in the mock ---
    // Always create follower as a plain object with all methods as jest mocks
    (prisma as any).follower = {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    };
    // Always create user as a plain object with findUnique as a jest mock
    (prisma as any).user = {
      findUnique: jest.fn().mockResolvedValue({ id: 'user2', name: 'User 2' }),
    };
    // Always create profile as a plain object with findUnique as a jest mock
    (prisma as any).profile = {
      findUnique: jest.fn().mockResolvedValue({
        id: 'profile1',
        userId: 'user2',
        bio: 'Test bio',
      }),
    };
    // --- End structure setup ---

    // Reset mocks before each test
    (prisma.follower.create as jest.Mock).mockClear();
    (prisma.follower.deleteMany as jest.Mock).mockClear();
    (prisma.follower.findMany as jest.Mock).mockClear();

    // Set default mock implementations (can be overridden in tests)
    (prisma.follower.create as jest.Mock).mockResolvedValue(
      mockFollowerRelation,
    );
    (prisma.follower.deleteMany as jest.Mock).mockResolvedValue({ count: 1 }); // Default success for delete
    // Default for findMany depends on usage, set specific values in tests
    (prisma.follower.findMany as jest.Mock).mockImplementation(async (args) => {
      // Check the 'include' structure to differentiate calls
      if (args.include?.follower) {
        return mockFollowerList; // For getFollowers
      } else if (args.include?.following) {
        return mockFollowingList; // For getFollowing
      }
      return []; // Default empty array if structure doesn't match
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Tests for followUser ---
  describe('followUser', () => {
    it('should create a follower relationship', async () => {
      const followerId = 'user1';
      const followingId = 'user2';
      const result = await service.followUser(followerId, followingId);

      expect(result).toEqual(mockFollowerRelation);
      expect(prisma.follower.create).toHaveBeenCalledTimes(1);
      expect(prisma.follower.create).toHaveBeenCalledWith({
        data: { followerId, followedId: followingId },
      });
    });

    it('should throw BadRequestException when trying to follow self', async () => {
      const userId = 'user1';
      await expect(service.followUser(userId, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.followUser(userId, userId)).rejects.toThrow(
        "Can't follow yourself",
      );
      expect(prisma.follower.create).not.toHaveBeenCalled();
    });
  });

  // --- Tests for unfollowUser ---
  describe('unfollowUser', () => {
    it('should delete a follower relationship', async () => {
      const followerId = 'user1';
      const followingId = 'user2';
      const result = await service.unfollowUser(followerId, followingId);

      expect(result).toEqual({ count: 1 }); // Prisma deleteMany returns count
      expect(prisma.follower.deleteMany).toHaveBeenCalledTimes(1);
      expect(prisma.follower.deleteMany).toHaveBeenCalledWith({
        where: { followerId, followedId: followingId },
      });
    });
  });

  // --- Tests for getFollowers ---
  describe('getFollowers', () => {
    it('should return a list of followers with follower details', async () => {
      const userId = 'user2'; // User whose followers we want
      const result = await service.getFollowers(userId);

      expect(result).toEqual(mockFollowerList);
      expect(prisma.follower.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.follower.findMany).toHaveBeenCalledWith({
        where: { followedId: userId },
        include: { follower: true },
      });
    });
  });

  // --- Tests for getFollowing ---
  describe('getFollowing', () => {
    it('should return a list of users being followed with following details', async () => {
      const userId = 'user1'; // User whose following list we want
      const result = await service.getFollowing(userId);

      expect(result).toEqual(mockFollowingList);
      expect(prisma.follower.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.follower.findMany).toHaveBeenCalledWith({
        where: { followerId: userId },
        include: { follower: true },
      });
    });
  });
});
