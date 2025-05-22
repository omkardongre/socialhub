import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';

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

  async createProfile(createProfileDto: CreateProfileDto) {
    // Create both user and profile in a transaction
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          id: createProfileDto.userId,
          email: createProfileDto.email,
        },
      });

      return prisma.profile.create({
        data: {
          user: { connect: { id: user.id } },
          name: createProfileDto.email.split('@')[0],
        },
      });
    });
  }
}
