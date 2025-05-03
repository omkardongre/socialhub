import { Injectable } from '@nestjs/common';
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
    return this.prisma.profile.update({
      where: { userId },
      data,
    });
  }
}
