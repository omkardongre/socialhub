import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Query,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
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
    private configService: ConfigService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Check health of the service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck() {
    return { status: 'ok' };
  }

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
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const tokens = await this.authService.login(dto);

    // Set access token as HttpOnly cookie
    res.cookie('token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
    });

    return res.json({
      success: true,
      message: 'Login successful',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  getProfile(@Req() req: JwtRequest) {
    return {
      success: true,
      data: { user: req.user },
      message: 'Current user profile',
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT tokens' })
  @ApiResponse({ status: 201, description: 'Tokens refreshed' })
  @ApiResponse({ status: 403, description: 'Invalid refresh token' })
  async refreshToken(@Body() body: { refresh_token: string }) {
    if (!body.refresh_token) {
      throw new BadRequestException('Refresh token is required');
    }
    const { refresh_token } = body;
    const result = await this.authService.refreshTokens(refresh_token);

    return {
      success: true,
      data: {
        access_token: result.access_token,
        user: result.user,
      },
      message: 'Tokens refreshed successfully',
    };
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({ status: 404, description: 'Invalid token' })
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      const result = await this.authService.verifyEmail(token);
      // Show a simple HTML page on success
      const loginUrl = this.configService.get<string>('SIGNUP_SUCCESS_URL');
      return res.status(200).send(`
        <html>
          <head><title>Email Verified</title></head>
          <body style="font-family:sans-serif;text-align:center;padding-top:50px;">
            <h1>✅ Email Verified!</h1>
            <p>${result.message}</p>
            <a href="${loginUrl}">Go to Login</a>
          </body>
        </html>
      `);
    } catch (error) {
      // Show error as HTML
      return res.status(400).send(`
        <html>
          <head><title>Verification Failed</title></head>
          <body style="font-family:sans-serif;text-align:center;padding-top:50px;">
            <h1>❌ Verification Failed</h1>
            <p>${error.message || 'Invalid or expired verification link.'}</p>
          </body>
        </html>
      `);
    }
  }
}
