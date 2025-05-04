import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new ConflictException('Email already in use');

    const hash = await bcrypt.hash(dto.password, 10);
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
    const pwMatch = await bcrypt.compare(dto.password, user.password);
    if (!pwMatch) throw new ForbiddenException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
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
}
