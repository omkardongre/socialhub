import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfilesService {
  async searchProfiles(query: string) {
    // Search by name or email substring (case-insensitive)
    const profiles = await this.prisma.profile.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        userId: true,
        name: true,
        avatarUrl: true,
      },
      take: 10,
    });
    return profiles;
  }

  private readonly logger = new Logger(ProfilesService.name);

  constructor(private prisma: PrismaService) {}

  async getProfileByUserId(userId: string) {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
      });

      if (!profile) {
        this.logger.warn(`Profile not found for user ID: ${userId}`);
        throw new NotFoundException('Profile not found');
      }

      return profile;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch profile for user ID: ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch profile');
    }
  }

  async updateProfile(
    userId: string,
    data: { bio?: string; avatarUrl?: string },
  ) {
    try {
      const updatedProfile = await this.prisma.profile.update({
        where: { userId },
        data,
      });
      this.logger.log(`Profile updated for user ID: ${userId}`);
      return updatedProfile;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Profile not found for update: ${userId}`);
          throw new NotFoundException('Profile not found');
        }
        if (error.code === 'P2002') {
          this.logger.warn(`Duplicate profile update attempt: ${userId}`);
          throw new ConflictException(
            'Profile already exists with these details',
          );
        }
      }

      this.logger.error(
        `Failed to update profile for user ID: ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async createProfile(createProfileDto: CreateProfileDto) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        try {
          const user = await prisma.user.create({
            data: {
              id: createProfileDto.userId,
              email: createProfileDto.email,
            },
          });
          this.logger.log(`User created with ID: ${user.id}`);

          const profile = await prisma.profile.create({
            data: {
              user: { connect: { id: user.id } },
              name: createProfileDto.email.split('@')[0],
            },
          });
          this.logger.log(`Profile created for user ID: ${user.id}`);

          return profile;
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              this.logger.warn(
                `User or profile already exists: ${createProfileDto.userId}`,
              );
              throw new ConflictException('User or profile already exists');
            }
          }
          this.logger.error(
            'Failed to create user or profile in transaction',
            error.stack,
          );
          throw new InternalServerErrorException('Failed to create profile');
        }
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error(
        'Transaction failed during profile creation',
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create profile');
    }
  }
}
