import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  ForbiddenException,
  Query,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { Session } from './types/session.type';

interface JwtRequest extends Request {
  user?: any;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: JwtRequest) {
    return req.user;
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refresh_token: string }) {
    const { refresh_token } = body;
    let payload: any;
    try {
      payload = this.jwtService.verify(refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }
    // Find all sessions for this user
    const sessions: Session[] = await this.prisma.session.findMany({
      where: {
        userId: payload.sub,
        expiresAt: { gte: new Date() }, // only non-expired
      },
    });
    // Find a session with a matching refresh token
    let validSession;
    for (const session of sessions) {
      if (await bcrypt.compare(refresh_token, session.refreshToken)) {
        validSession = session;
        break;
      }
    }
    if (!validSession) {
      throw new ForbiddenException('Invalid refresh token');
    }
    // Issue new access token
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException('User not found');
    const newAccessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    );
    return { access_token: newAccessToken };
  }

  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });
    if (!user) throw new NotFoundException('Invalid token');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });
    return { message: 'Email verified successfully' };
  }
}
