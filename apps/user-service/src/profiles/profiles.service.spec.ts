import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
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
      expect(result).toEqual(mockProfile);
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: '123' },
      });
    });

    it('should return null when profile not found', async () => {
      // Set mock implementation for this specific test
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await service.getProfileByUserId('invalid-id');
      expect(result).toBeNull();
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

    it('should rethrow other errors', async () => {
      const testError = new Error('Database error');
      // Set mock implementation for this specific test
      (prisma.profile.update as jest.Mock).mockRejectedValue(testError);
      await expect(service.updateProfile('123', {})).rejects.toThrow(testError);
    });
  });
});
