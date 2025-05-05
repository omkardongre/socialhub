import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FollowersService } from './followers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('Followers')
@ApiBearerAuth()
@Controller('followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Post('follow/:id')
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({ status: 201, description: 'User followed' })
  async follow(@Req() req, @Param('id') userId: string) {
    const result = await this.followersService.followUser(req.user.userId, userId);
    return {
      success: true,
      data: result,
      message: 'Successfully followed user'
    };
  }

  @Delete('unfollow/:id')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({ status: 200, description: 'User unfollowed' })
  async unfollow(@Req() req, @Param('id') userId: string) {
    const result = await this.followersService.unfollowUser(req.user.userId, userId);
    return {
      success: true,
      data: result,
      message: 'Successfully unfollowed user'
    };
  }

  @Get('followers')
  @ApiOperation({ summary: 'Get your followers' })
  @ApiResponse({ status: 200, description: 'List of followers' })
  async getFollowers(@Req() req) {
    const followers = await this.followersService.getFollowers(req.user.userId);
    return {
      success: true,
      data: followers,
      message: 'Followers retrieved successfully'
    };
  }

  @Get('following')
  @ApiOperation({ summary: 'Get users you are following' })
  @ApiResponse({ status: 200, description: 'List of following users' })
  async getFollowing(@Req() req) {
    const following = await this.followersService.getFollowing(req.user.userId);
    return {
      success: true,
      data: following,
      message: 'Following list retrieved successfully'
    };
  }
}
