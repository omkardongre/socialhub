import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getProfileByUserId(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
    });
  }

  async updateProfile(
    userId: string,
    data: { bio?: string; avatarUrl?: string },
  ) {
    try {
      return await this.prisma.profile.update({
        where: { userId },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Profile not found');
      }
      throw error;
    }
  }
}
