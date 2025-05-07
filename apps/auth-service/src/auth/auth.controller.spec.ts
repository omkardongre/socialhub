// apps/auth-service/src/auth/auth.controller.spec.ts
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
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
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
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

      expect(authService.signup).toHaveBeenCalledWith(dto);
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

      expect(authService.login).toHaveBeenCalledWith(dto);
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
      const mockSession = {
        refreshToken: await bcrypt.hash(validToken, 10),
      };
      const mockUser = { id: '1', email: 'test@example.com' };

      // Mock JWT verification
      mockJwtService.verify.mockReturnValue({ sub: '1' });
      // Mock session lookup
      mockPrisma.session.findMany.mockResolvedValue([mockSession]);
      // Mock user lookup
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      // Mock token signing
      mockJwtService.signAsync.mockResolvedValue('new.access.token');

      const result = await controller.refreshToken({
        refresh_token: validToken,
      });

      expect(result).toEqual({
        success: true,
        data: { access_token: 'new.access.token' },
        message: 'Tokens refreshed successfully',
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const validToken = 'valid-token';
      const mockUser = { id: '1', verificationToken: validToken };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        isVerified: true,
        verificationToken: null,
      });

      const result = await controller.verifyEmail(validToken);

      expect(result).toEqual({
        success: true,
        message: 'Email verified successfully',
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isVerified: true, verificationToken: null },
      });
    });

    it('should throw NotFoundException for invalid token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(controller.verifyEmail('invalid-token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
