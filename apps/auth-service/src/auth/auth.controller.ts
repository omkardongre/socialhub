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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

interface JwtRequest extends Request {
  user?: any;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: SignupDto })
  async signup(@Body() dto: SignupDto) {
    const result = await this.authService.signup(dto);
    return {
      success: true,
      data: { userId: result.userId },
      message: result.message,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive JWT tokens' })
  @ApiResponse({ status: 201, description: 'Login successful' })
  @ApiResponse({ status: 403, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto) {
    const tokens = await this.authService.login(dto);
    return {
      success: true,
      data: tokens,
      message: 'Login successful',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  getProfile(@Req() req: JwtRequest) {
    return req.user;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT tokens' })
  @ApiResponse({ status: 201, description: 'Tokens refreshed' })
  @ApiResponse({ status: 403, description: 'Invalid refresh token' })
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
    return {
      success: true,
      data: { access_token: newAccessToken },
      message: 'Tokens refreshed successfully',
    };
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({ status: 404, description: 'Invalid token' })
  async verifyEmail(@Query('token') token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });
    if (!user) throw new NotFoundException('Invalid token');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });
    return {
      success: true,
      message: 'Email verified successfully',
    };
  }
}
