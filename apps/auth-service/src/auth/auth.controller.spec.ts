// apps/auth-service/src/auth/auth.controller.spec.ts
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    verifyEmail: jest.fn().mockResolvedValue({
      success: true,
      message: 'Email verified successfully',
    }),
    refreshTokens: jest.fn().mockResolvedValue({
      access_token: 'access',
      refresh_token: 'refresh',
    }),
  };

  const mockJwtService = {
    verify: jest.fn(),
    signAsync: jest.fn(),
  };

  const mockPrisma = {
    session: {
      findMany: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  jest.mock('bcrypt', () => ({
    hash: jest.fn().mockImplementation((token) => `hashed_${token}`),
    compare: jest.fn().mockResolvedValue(true),
  }));

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should return formatted signup response', async () => {
      const dto: SignupDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      mockAuthService.signup.mockResolvedValue({
        userId: '1',
        message: 'Signup successful',
      });

      const result = await controller.signup(dto);

      expect(mockAuthService.signup).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        success: true,
        data: { userId: '1' },
        message: 'Signup successful',
      });
    });
  });

  describe('login', () => {
    it('should return formatted login response', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      mockAuthService.login.mockResolvedValue({
        access_token: 'access',
        refresh_token: 'refresh',
      });

      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        success: true,
        data: {
          access_token: 'access',
          refresh_token: 'refresh',
        },
        message: 'Login successful',
      });
    });
  });

  describe('getProfile', () => {
    it('should return user from request', () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockReq = { user: mockUser };

      const result = controller.getProfile(mockReq as any);

      expect(result).toEqual(mockUser);
    });
  });

  describe('refreshToken', () => {
    it('should return new access token for valid refresh token', async () => {
      const validToken = 'valid.refresh.token';
      const mockResult = {
        access_token: 'new.access.token',
        user: { id: '1', email: 'test@example.com' },
      };

      // Mock the authService.refreshTokens method
      mockAuthService.refreshTokens.mockResolvedValue(mockResult);

      const result = await controller.refreshToken({
        refresh_token: validToken,
      });

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(validToken);
      expect(result).toEqual({
        success: true,
        data: {
          access_token: 'new.access.token',
          user: { id: '1', email: 'test@example.com' },
        },
        message: 'Tokens refreshed successfully',
      });
    });

    it('should throw BadRequestException if no refresh token provided', async () => {
      await expect(
        controller.refreshToken({ refresh_token: '' }),
      ).rejects.toThrow(new BadRequestException('Refresh token is required'));
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const validToken = 'valid-token';

      mockAuthService.verifyEmail.mockResolvedValueOnce({
        success: true,
        message: 'Email verified successfully',
      });

      const result = await controller.verifyEmail(validToken);

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(validToken);
      expect(result).toEqual({
        success: true,
        message: 'Email verified successfully',
      });
    });

    it('should throw NotFoundException for invalid token', async () => {
      mockAuthService.verifyEmail.mockRejectedValueOnce(
        new NotFoundException('Invalid token'),
      );

      await expect(controller.verifyEmail('invalid-token')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('invalid-token');
    });
  });
});
