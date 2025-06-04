import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CreateProfileDto } from './dto/create-profile.dto';

@ApiTags('Profiles')
@ApiBearerAuth()
@Controller('profile')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for profile service' })
  @ApiResponse({ status: 200, description: 'Profile service is healthy' })
  health() {
    return {
      success: true,
      data: 'ok',
      message: 'Profile service is healthy',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile by user ID' })
  @ApiResponse({ status: 200, description: 'User profile found' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Param('id') id: string, @Req() req) {
    const profile = await this.profilesService.getProfileByUserId(id);
    if (!profile) throw new NotFoundException('Profile not found');
    return {
      success: true,
      data: profile,
      message: 'Profile retrieved successfully',
    };
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update your profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiBody({
    schema: {
      properties: {
        bio: { type: 'string', example: 'About me' },
        avatarUrl: {
          type: 'string',
          example: 'https://example.com/avatar.jpg',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req,
    @Body() body: { bio?: string; avatarUrl?: string },
  ) {
    const userId = req.user.userId;
    const updatedProfile = await this.profilesService.updateProfile(
      userId,
      body,
    );
    return {
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createProfileDto: CreateProfileDto) {
    const profile = await this.profilesService.createProfile(createProfileDto);
    return {
      success: true,
      data: profile,
      message: 'Profile created successfully',
    };
  }
}
