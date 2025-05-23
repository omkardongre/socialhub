import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
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
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userRestService: UserRestService,
    private notificationRestService: NotificationRestService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new ConflictException('Email already in use');

    const hash = await argon2.hash(dto.password);
    const verificationToken = randomUUID();
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        isVerified: false,
        verificationToken,
      },
    });
    // Simulate sending email by logging the verification URL
    console.log(
      `Verify your account: http://localhost:3000/auth/verify?token=${verificationToken}`,
    );
    return {
      userId: user.id,
      message: 'Signup successful. Please verify your email.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new ForbiddenException('Invalid credentials');
    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }
    const pwMatch = await argon2.verify(user.password, dto.password);
    if (!pwMatch) throw new ForbiddenException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );
    const hashedRefreshToken = await argon2.hash(refreshToken);
    const expiresAt = add(new Date(), { days: 7 });

    // Create a new session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: hashedRefreshToken,
        expiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });
    if (!user) throw new NotFoundException('Invalid token');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });

    try {
      // Create user profile
      await this.userRestService.createUserProfile({
        userId: user.id,
        email: user.email,
      });

      // Create default notification preferences
      await this.notificationRestService.createDefaultPreferences(user.id);
    } catch (error) {
      console.error('Failed to create user profile:', error);
      throw new InternalServerErrorException(
        'Verification succeeded but post-verification steps failed',
      );
    }

    return {
      success: true,
      message: 'Email verified and profile initialized successfully',
    };
  }
}
