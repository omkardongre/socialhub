import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowersService {
  constructor(private prisma: PrismaService) {}

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException("Can't follow yourself");
    return this.prisma.follower.create({
      data: { followerId, followingId },
    });
  }

  async unfollowUser(followerId: string, followingId: string) {
    return this.prisma.follower.deleteMany({
      where: { followerId, followingId },
    });
  }

  async getFollowers(userId: string) {
    return this.prisma.follower.findMany({
      where: { followingId: userId },
      include: { follower: true },
    });
  }

  async getFollowing(userId: string) {
    return this.prisma.follower.findMany({
      where: { followerId: userId },
      include: { following: true },
    });
  }
}
