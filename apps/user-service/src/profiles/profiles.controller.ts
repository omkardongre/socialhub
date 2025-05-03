import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('health')
  health() {
    return 'ok';
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    const profile = await this.profilesService.getProfileByUserId(id);
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  @Put()
  async updateProfile(
    @Req() req,
    @Body() body: { bio?: string; avatarUrl?: string },
  ) {
    const userId = req.user.userId;
    return this.profilesService.updateProfile(userId, body);
  }
}
