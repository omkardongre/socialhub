import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockProfile = {
  id: '1',
  userId: '123',
  email: 'test@example.com',
  bio: 'Test bio',
  avatarUrl: 'https://example.com/avatar.jpg',
  name: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCreateProfileDto = {
  userId: '123',
  email: 'test@example.com',
  bio: 'New profile bio',
  avatarUrl: 'https://example.com/new-avatar.jpg',
};

describe('ProfilesController', () => {
  let controller: ProfilesController;
  const mockProfilesService = {
    getProfileByUserId: jest.fn().mockResolvedValue(mockProfile),
    updateProfile: jest.fn().mockResolvedValue(mockProfile),
    createProfile: jest.fn().mockResolvedValue(mockProfile),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        { provide: ProfilesService, useValue: mockProfilesService },
        {
          provide: APP_PIPE,
          useValue: new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
          }),
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('health()', () => {
    it('should return health check status', () => {
      const result = controller.health();
      expect(result).toEqual({
        success: true,
        data: 'ok',
        message: 'Profile service is healthy',
      });
    });
  });

  describe('getProfile()', () => {
    const mockRequest = { user: { userId: '456' } };

    it('should return a profile when found', async () => {
      const result = await controller.getProfile('123', mockRequest);
      expect(result).toEqual({
        success: true,
        data: mockProfile,
        message: 'Profile retrieved successfully',
      });
      expect(mockProfilesService.getProfileByUserId).toHaveBeenCalledWith(
        '123',
        '456',
      );
    });

    it('should throw NotFoundException when profile not found', async () => {
      mockProfilesService.getProfileByUserId.mockResolvedValueOnce(null);
      await expect(
        controller.getProfile('invalid-id', mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(mockProfilesService.getProfileByUserId).toHaveBeenCalledWith(
        'invalid-id',
        '456',
      );
    });
  });

  describe('updateProfile()', () => {
    const updateDto = { bio: 'Updated bio' };
    const mockRequest = { user: { userId: '123' } };

    it('should update profile with valid data', async () => {
      const result = await controller.updateProfile(mockRequest, updateDto);
      expect(result).toEqual({
        success: true,
        data: mockProfile,
        message: 'Profile updated successfully',
      });
      expect(mockProfilesService.updateProfile).toHaveBeenCalledWith(
        '123',
        updateDto,
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { avatarUrl: 'https://new-avatar.com/1.jpg' };
      await controller.updateProfile(mockRequest, partialUpdate);
      expect(mockProfilesService.updateProfile).toHaveBeenCalledWith(
        '123',
        partialUpdate,
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockProfilesService.updateProfile.mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(
        controller.updateProfile(mockRequest, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create()', () => {
    it('should create a new profile', async () => {
      const result = await controller.create(mockCreateProfileDto);
      expect(result).toEqual({
        success: true,
        data: mockProfile,
        message: 'Profile created successfully',
      });
      expect(mockProfilesService.createProfile).toHaveBeenCalledWith(
        mockCreateProfileDto,
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockProfilesService.createProfile.mockRejectedValueOnce(error);
      await expect(controller.create(mockCreateProfileDto)).rejects.toThrow(
        error,
      );
    });
  });
});
