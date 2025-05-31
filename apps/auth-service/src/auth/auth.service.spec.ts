import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserRestService } from '../external/user/user.rest.service';
import { NotificationRestService } from '../external/notification/notification.rest.service';

// Mock the external services
const mockUserRestService = {
  createUserProfile: jest.fn().mockResolvedValue({ success: true }),
};

const mockNotificationRestService = {
  createDefaultPreferences: jest.fn().mockResolvedValue({ success: true }),
};

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  verify: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let userRestService: UserRestService;
  let notificationRestService: NotificationRestService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashed_password',
    isVerified: true,
    verificationToken: 'valid_token',
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            session: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock_token'),
            verify: jest.fn(),
          },
        },
        {
          provide: UserRestService,
          useValue: mockUserRestService,
        },
        {
          provide: NotificationRestService,
          useValue: mockNotificationRestService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    userRestService = module.get<UserRestService>(UserRestService);
    notificationRestService = module.get<NotificationRestService>(
      NotificationRestService,
    );

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user with hashed password', async () => {
      const dto = { email: 'test@example.com', password: 'Password123!' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.signup(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(argon2.hash).toHaveBeenCalledWith(dto.password);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toEqual({
        userId: mockUser.id,
        message: 'Signup successful. Please verify your email.',
      });
    });

    it('should throw ConflictException for existing email', async () => {
      const dto = { email: 'exists@example.com', password: 'Password123!' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(authService.signup(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');
    });

    it('should return tokens for valid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'Password123!' };

      const result = await authService.login(dto);

      expect(result).toEqual({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
      expect(prisma.session.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for invalid user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const dto = { email: 'wrong@example.com', password: 'Password123!' };

      await expect(authService.login(dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException for unverified email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        isVerified: false,
      });
      const dto = { email: 'test@example.com', password: 'Password123!' };

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException for invalid password', async () => {
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);
      const dto = { email: 'test@example.com', password: 'WrongPassword' };

      await expect(authService.login(dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      // Mock the findFirst to return a user with isVerified: false
      const unverifiedUser = { ...mockUser, isVerified: false };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(unverifiedUser);

      // Mock the update to return the verified user
      const verifiedUser = {
        ...unverifiedUser,
        isVerified: true,
        verificationToken: null,
      };
      (prisma.user.update as jest.Mock).mockResolvedValue(verifiedUser);

      const result = await authService.verifyEmail('valid_token');

      // Verify the correct methods were called with the right arguments
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { verificationToken: 'valid_token' },
      });

      // The key fix: Make sure the mock is set up before the service call
      // and verify the exact call
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: unverifiedUser.id },
        data: {
          isVerified: true,
          verificationToken: null,
        },
      });

      // Verify the rest of the test
      expect(userRestService.createUserProfile).toHaveBeenCalledWith({
        userId: unverifiedUser.id,
        email: unverifiedUser.email,
      });
      expect(result).toEqual({
        success: true,
        message: 'Email verified and profile initialized successfully',
      });
    });

    it('should throw NotFoundException for invalid token', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return success if email is already verified', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        ...mockUser,
        isVerified: true,
      });

      const result = await authService.verifyEmail('valid_token');

      expect(result).toEqual({
        success: true,
        message: 'Email already verified',
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
