import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Mock PrismaService directly
jest.mock('../prisma/prisma.service');

describe('ProfilesService', () => {
  let service: ProfilesService;
  let prisma: jest.Mocked<PrismaService>; // Revert to Mocked

  const mockProfile = {
    id: '1',
    userId: '123',
    bio: 'Test bio',
    avatarUrl: 'https://example.com/avatar.jpg',
    name: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // Remove custom PrismaService provider
      providers: [ProfilesService, PrismaService],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    // Inject the mocked PrismaService
    prisma = module.get(PrismaService);

    // Ensure the nested structure exists in the mock
    if (!prisma.profile) {
      (prisma as any).profile = {};
    }
    if (!prisma.profile.findUnique) {
      (prisma.profile as any).findUnique = jest.fn();
    }
    if (!prisma.profile.update) {
      (prisma.profile as any).update = jest.fn();
    }

    // Set default mock implementations (can be overridden in tests)
    (prisma.profile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
    // Make update return a profile reflecting the changes
    (prisma.profile.update as jest.Mock).mockImplementation(async (args) => {
      return { ...mockProfile, ...args.data };
    });
  });

  describe('getProfileByUserId', () => {
    it('should return profile when exists', async () => {
      const result = await service.getProfileByUserId('123');
      expect(result).toEqual({ ...mockProfile, isFollowing: false });
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: '123' },
      });
    });

    it('should throw NotFoundException when profile not found', async () => {
      // Set mock implementation for this specific test
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getProfileByUserId('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updateData = { bio: 'Updated bio' };
      const result = await service.updateProfile('123', updateData);
      expect(result.bio).toBe('Updated bio');
      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { userId: '123' },
        data: updateData,
      });
    });

    it('should throw NotFoundException for non-existent profile', async () => {
      // Set mock implementation for this specific test
      (prisma.profile.update as jest.Mock).mockRejectedValue(
        new PrismaClientKnownRequestError('Not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        }),
      );
      await expect(service.updateProfile('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException for unknown errors', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const testError = new Error('Database error');
      // Set mock implementation for this specific test
      (prisma.profile.update as jest.Mock).mockRejectedValue(testError);
      await expect(service.updateProfile('123', {})).rejects.toThrowError(
        expect.objectContaining({
          message: 'Failed to update profile',
          name: 'InternalServerErrorException',
        }),
      );
      loggerSpy.mockRestore();
    });
  });

  describe('createProfile', () => {
    const mockCreateProfileDto = {
      userId: '123',
      email: 'test@example.com',
    };
    beforeEach(() => {
      // Mock $transaction for each test
      (prisma as any).$transaction = jest.fn();
    });

    it('should create a profile successfully', async () => {
      const mockUser = {
        id: mockCreateProfileDto.userId,
        email: mockCreateProfileDto.email,
      };
      const mockProfile = { id: '1', userId: mockCreateProfileDto.userId };
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        // Simulate the transactional callback
        return cb({
          user: { create: jest.fn().mockResolvedValue(mockUser) },
          profile: { create: jest.fn().mockResolvedValue(mockProfile) },
        });
      });
      const result = await service.createProfile(mockCreateProfileDto as any);
      expect(result).toEqual(mockProfile);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw ConflictException if user or profile already exists', async () => {
      const { ConflictException } = require('@nestjs/common');
      const Prisma = require('@prisma/client').Prisma;
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        // Simulate the transactional callback where profile.create throws
        return cb({
          user: { create: jest.fn().mockResolvedValue({ id: mockCreateProfileDto.userId, email: mockCreateProfileDto.email }) },
          profile: {
            create: jest.fn().mockImplementation(() => {
              throw new Prisma.PrismaClientKnownRequestError('Duplicate', { code: 'P2002', clientVersion: '5.0.0' });
            }),
          },
        });
      });
      await expect(service.createProfile(mockCreateProfileDto as any)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException for unknown errors', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const { InternalServerErrorException } = require('@nestjs/common');
      (prisma.$transaction as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });
      await expect(
        service.createProfile(mockCreateProfileDto as any),
      ).rejects.toThrow(InternalServerErrorException);
      loggerSpy.mockRestore();
    });
  });
});
