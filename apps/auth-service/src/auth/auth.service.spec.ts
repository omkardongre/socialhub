import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            session: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user with hashed password', async () => {
      const dto = { email: 'test@example.com', password: 'Password123!' };
      const mockUser = { id: '1', email: dto.email, password: 'hashed' };

      // Mock bcrypt hash
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      // Mock prisma responses
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.signup(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: dto.email,
          password: 'hashed',
          isVerified: false,
          verificationToken: expect.any(String),
        }),
      });
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
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashed',
      isVerified: true,
    };

    beforeEach(() => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
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
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const dto = { email: 'test@example.com', password: 'WrongPassword' };

      await expect(authService.login(dto)).rejects.toThrow(ForbiddenException);
    });
  });
});
