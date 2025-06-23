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
  let mockAuthService: any;
  let mockJwtService: any;
  let mockPrisma: any;

  beforeEach(async () => {
    mockAuthService = {
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

    mockJwtService = {
      verify: jest.fn(),
      signAsync: jest.fn(),
    };

    mockPrisma = {
      session: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
    };

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
    it('should set cookie and return success json', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      mockAuthService.login.mockResolvedValue({
        access_token: 'access',
        refresh_token: 'refresh',
      });
      const mockRes: any = {
        cookie: jest.fn(),
        json: jest.fn(),
      };
      await controller.login(dto, mockRes);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        'access',
        expect.objectContaining({ httpOnly: true })
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
      });
    });
  });

  describe('getProfile', () => {
    it('should return user from request', () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockReq = { user: mockUser };
      const result = controller.getProfile(mockReq as any);
      expect(result).toEqual({
        success: true,
        data: { user: mockUser },
        message: 'Current user profile',
      });
    });
  });

  describe('refreshToken', () => {
    it('should return new access token for valid refresh token', async () => {
      const validToken = 'valid.refresh.token';
      const mockResult = {
        access_token: 'new.access.token',
        user: { id: '1', email: 'test@example.com' },
      };

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

  describe('logout', () => {
    it('should delete user sessions, clear cookie, and return success message', async () => {
      const mockUser = { userId: '1', email: 'test@example.com' };
      const mockReq: any = { user: mockUser };
      const mockRes: any = {
        clearCookie: jest.fn(),
        json: jest.fn(),
      };
      mockPrisma.session.deleteMany = jest.fn().mockResolvedValue({ count: 1 });

      await controller.logout(mockReq, mockRes);

      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: '1' } });
      expect(mockRes.clearCookie).toHaveBeenCalledWith('token', expect.objectContaining({ httpOnly: true }));
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Logged out' });
    });
  });

  describe('healthCheck', () => {
    it('should return status ok', () => {
      const result = controller.healthCheck();
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('verifyEmail', () => {
    it('should send HTML on success', async () => {
      const validToken = 'valid-token';
      mockAuthService.verifyEmail.mockResolvedValueOnce({
        success: true,
        message: 'Email verified successfully',
      });
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      await controller.verifyEmail(validToken, mockRes);
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(validToken);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Email Verified'));
    });

    it('should send HTML error on failure', async () => {
      mockAuthService.verifyEmail.mockRejectedValueOnce(
        new NotFoundException('Invalid token'),
      );
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      await controller.verifyEmail('invalid-token', mockRes);
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('invalid-token');
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Verification Failed'));
    });
  });
});
