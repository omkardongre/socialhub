import { Controller, Post, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Post('follow/:id')
  async follow(@Req() req, @Param('id') userId: string) {
    return this.followersService.followUser(req.user.userId, userId);
  }

  @Delete('unfollow/:id')
  async unfollow(@Req() req, @Param('id') userId: string) {
    return this.followersService.unfollowUser(req.user.userId, userId);
  }

  @Get('followers')
  async getFollowers(@Req() req) {
    return this.followersService.getFollowers(req.user.userId);
  }

  @Get('following')
  async getFollowing(@Req() req) {
    return this.followersService.getFollowing(req.user.userId);
  }
}
