import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { NotFoundException } from '@nestjs/common';

const mockProfile = {
  id: '1',
  userId: '123',
  bio: 'Test bio',
  avatarUrl: 'https://example.com/avatar.jpg',
  name: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProfilesController', () => {
  let controller: ProfilesController;
  const mockProfilesService = {
    getProfileByUserId: jest.fn().mockResolvedValue(mockProfile),
    updateProfile: jest.fn().mockResolvedValue(mockProfile),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        { provide: ProfilesService, useValue: mockProfilesService },
        // Provide ValidationPipe globally for this test module
        {
          provide: APP_PIPE,
          useValue: new ValidationPipe({ transform: true, whitelist: true }), // Configure as needed
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  describe('health()', () => {
    it('should return health check status', () => {
      expect(controller.health()).toEqual({
        success: true,
        data: 'ok',
        message: 'Profile service is healthy',
      });
    });
  });

  describe('getProfile()', () => {
    it('should return a profile', async () => {
      await expect(controller.getProfile('123')).resolves.toEqual({
        success: true,
        data: mockProfile,
        message: 'Profile retrieved successfully',
      });
    });

    it('should throw NotFoundException', async () => {
      mockProfilesService.getProfileByUserId.mockResolvedValue(null);
      await expect(controller.getProfile('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile()', () => {
    it('should update profile', async () => {
      const updateDto = { bio: 'New bio' };
      await expect(
        controller.updateProfile({ user: { userId: '123' } }, updateDto),
      ).resolves.toMatchObject({
        // Use toMatchObject for partial matching
        success: true,
        data: mockProfile,
        message: expect.stringContaining('Profile updated successfully'), // Check if message contains the text
      });
    });
  });
});
