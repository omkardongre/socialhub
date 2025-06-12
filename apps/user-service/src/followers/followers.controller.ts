import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  NotFoundException,
  HttpException,
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
@Controller('users')
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
  @Post(':id/follow')
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({ status: 201, description: 'User followed' })
  async follow(@CurrentUser() user, @Param('id') userId: string) {
    console.log(' user ' + user.userId + ' following ' + userId);
    const result = await this.followersService.followUser(user.userId, userId);
    return {
      success: true,
      data: result,
      message: 'Successfully followed user',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/follow')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({ status: 200, description: 'User unfollowed' })
  async unfollow(@CurrentUser() user, @Param('id') userId: string) {
    try {
      console.log(' user ' + user.userId + ' following ' + userId);
      const result = await this.followersService.unfollowUser(
        user.userId,
        userId,
      );
      return {
        success: true,
        data: result,
        message: 'Successfully unfollowed user',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          { success: false, message: 'You are not following this user' },
          404,
        );
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/followers')
  @ApiOperation({ summary: 'Get followers of a user' })
  @ApiResponse({ status: 200, description: 'List of followers' })
  async getFollowers(@Param('id') userId: string) {
    const followers = await this.followersService.getFollowers(userId);
    return {
      success: true,
      data: followers,
      message: 'Followers list retrieved successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/following')
  @ApiOperation({ summary: 'Get users a user is following' })
  @ApiResponse({ status: 200, description: 'List of following users' })
  async getFollowing(@Param('id') userId: string) {
    const following = await this.followersService.getFollowing(userId);
    return {
      success: true,
      data: following,
      message: 'Following list retrieved successfully',
    };
  }
}
