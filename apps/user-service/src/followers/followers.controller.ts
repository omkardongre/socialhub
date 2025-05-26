import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FollowersService } from './followers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Followers')
@ApiBearerAuth()
@Controller('followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for followers module' })
  @ApiResponse({ status: 200, description: 'Followers module is healthy' })
  health() {
    return {
      success: true,
      data: 'ok',
      message: 'Followers module is healthy',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('follow/:id')
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({ status: 201, description: 'User followed' })
  async follow(@CurrentUser() user: JwtPayload, @Param('id') userId: string) {
    const result = await this.followersService.followUser(user.sub, userId);
    return {
      success: true,
      data: result,
      message: 'Successfully followed user',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('unfollow/:id')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({ status: 200, description: 'User unfollowed' })
  async unfollow(@CurrentUser() user: JwtPayload, @Param('id') userId: string) {
    const result = await this.followersService.unfollowUser(user.sub, userId);
    return {
      success: true,
      data: result,
      message: 'Successfully unfollowed user',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('followers')
  @ApiOperation({ summary: 'Get your followers' })
  @ApiResponse({ status: 200, description: 'List of followers' })
  async getFollowers(@CurrentUser() user: JwtPayload) {
    const followers = await this.followersService.getFollowers(user.sub);
    return {
      success: true,
      data: followers,
      message: 'Followers list retrieved successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('following')
  @ApiOperation({ summary: 'Get users you are following' })
  @ApiResponse({ status: 200, description: 'List of following users' })
  async getFollowing(@CurrentUser() user: JwtPayload) {
    const following = await this.followersService.getFollowing(user.sub);
    return {
      success: true,
      data: following,
      message: 'Following list retrieved successfully',
    };
  }
}
