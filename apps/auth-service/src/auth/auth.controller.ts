import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

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
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Invalid refresh token');
    const isValid = await bcrypt.compare(refresh_token, user.refreshToken);
    if (!isValid) throw new ForbiddenException('Invalid refresh token');
    const newAccessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    );
    return { access_token: newAccessToken };
  }
}
