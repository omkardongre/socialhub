import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { UserRestService } from 'src/external/user/user.rest.service';
import { NotificationRestService } from 'src/external/notification/notification.rest.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userRestService: UserRestService,
    private notificationRestService: NotificationRestService,
  ) {}

  async signup(dto: SignupDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      const hash = await argon2.hash(dto.password).catch((error) => {
        this.logger.error('Password hashing failed', error.stack);
        throw new InternalServerErrorException('Failed to process password');
      });

      const verificationToken = randomUUID();

      const user = await this.prisma.user
        .create({
          data: {
            email: dto.email,
            password: hash,
            isVerified: false,
            verificationToken,
          },
        })
        .catch((error) => {
          this.logger.error('User creation failed', error);
          throw new InternalServerErrorException(
            'Failed to create user account',
          );
        });

      this.logger.log(
        `Verify your account: http://localhost:3000/auth/verify?token=${verificationToken}`,
      );

      return {
        userId: user.id,
        message: 'Signup successful. Please verify your email.',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Signup failed', error.stack);
      throw new InternalServerErrorException(
        'Failed to complete signup process',
      );
    }
  }

  async login(dto: LoginDto) {
    try {
      if (!dto.email || !dto.password) {
        throw new BadRequestException('Email and password are required');
      }

      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        throw new ForbiddenException('Invalid credentials');
      }

      if (!user.isVerified) {
        throw new UnauthorizedException('Email not verified');
      }

      const pwMatch = await argon2
        .verify(user.password, dto.password)
        .catch((error) => {
          this.logger.error('Password verification failed', error.stack);
          throw new InternalServerErrorException('Failed to verify password');
        });

      if (!pwMatch) {
        throw new ForbiddenException('Invalid credentials');
      }

      let accessToken: string;
      let refreshToken: string;

      try {
        accessToken = await this.jwtService.signAsync({
          sub: user.id,
          email: user.email,
        });

        refreshToken = await this.jwtService.signAsync(
          { sub: user.id },
          {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
          },
        );
      } catch (error) {
        this.logger.error('Token generation failed', error.stack);
        throw new InternalServerErrorException(
          'Failed to generate authentication tokens',
        );
      }

      const hashedRefreshToken = await argon2
        .hash(refreshToken)
        .catch((error) => {
          this.logger.error('Token hashing failed', error.stack);
          throw new InternalServerErrorException(
            'Failed to process authentication',
          );
        });

      const expiresAt = add(new Date(), { days: 7 });

      try {
        await this.prisma.session.create({
          data: {
            userId: user.id,
            refreshToken: hashedRefreshToken,
            expiresAt,
          },
        });
      } catch (error) {
        this.logger.error('Session creation failed', error.stack);
        throw new InternalServerErrorException('Failed to create user session');
      }

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Login failed', error.stack);
      throw new InternalServerErrorException('Failed to process login');
    }
  }
  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    let user;
    try {
      user = await this.prisma.user.findFirst({
        where: { verificationToken: token },
      });
    } catch (error) {
      this.logger.error(
        'Failed to find user by verification token',
        error.stack,
      );
      throw new InternalServerErrorException('Failed to verify email');
    }

    if (!user) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    if (user.isVerified) {
      return {
        success: true,
        message: 'Email already verified',
      };
    }

    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, verificationToken: null },
      });

      try {
        await this.userRestService.createUserProfile({
          userId: user.id,
          email: user.email,
        });
      } catch (error) {
        this.logger.error('Failed to create user profile', error.stack);
        throw new InternalServerErrorException('Failed to create user profile');
      }

      try {
        await this.notificationRestService.createDefaultPreferences(user.id);
      } catch (error) {
        this.logger.error(
          'Failed to create notification preferences',
          error.stack,
        );
        // Continue even if notification preferences fail
      }

      return {
        success: true,
        message: 'Email verified and profile initialized successfully',
      };
    } catch (error) {
      this.logger.error('Email verification failed', error.stack);
      throw new InternalServerErrorException(
        'Failed to complete email verification',
      );
    }
  }
}
