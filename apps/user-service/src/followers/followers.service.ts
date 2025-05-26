import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import {
  createUserFollowedEvent,
  createUserUnfollowedEvent,
} from '@libs/events';

@Injectable()
export class FollowersService {
  private readonly logger = new Logger(FollowersService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitmqClient: ClientProxy,
  ) {}

  async followUser(followerId: string, followingId: string) {
    try {
      if (followerId === followingId) {
        throw new BadRequestException("Can't follow yourself");
      }

      const follow = await this.prisma.follower.create({
        data: { followerId, followingId },
      });

      try {
        const followEvent = createUserFollowedEvent({
          followerId,
          followedId: followingId,
          followedAt: new Date().toISOString(),
        });
        this.rabbitmqClient.emit(followEvent.event, followEvent);
        this.logger.log(`User ${followerId} followed user ${followingId}`);
      } catch (error) {
        this.logger.error(
          `Failed to emit follow event for user ${followerId}`,
          error.stack,
        );
        // Don't fail the operation if event emission fails
      }

      return follow;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.warn(
            `Already following: ${followerId} -> ${followingId}`,
          );
          throw new BadRequestException('Already following this user');
        }
        if (error.code === 'P2003') {
          this.logger.warn(
            `User not found in follow attempt: ${followerId} -> ${followingId}`,
          );
          throw new NotFoundException('One or both users not found');
        }
      }

      this.logger.error(`Failed to follow user ${followingId}`, error.stack);
      throw new InternalServerErrorException('Failed to follow user');
    }
  }

  async unfollowUser(followerId: string, followingId: string) {
    try {
      const result = await this.prisma.follower.deleteMany({
        where: { followerId, followingId },
      });

      if (result.count === 0) {
        this.logger.warn(
          `No follow relationship found: ${followerId} -> ${followingId}`,
        );
        throw new NotFoundException('No follow relationship found');
      }

      try {
        const unfollowEvent = createUserUnfollowedEvent({
          followerId,
          unfollowedId: followingId,
          unfollowedAt: new Date().toISOString(),
        });
        this.rabbitmqClient.emit(unfollowEvent.event, unfollowEvent);
        this.logger.log(`User ${followerId} unfollowed user ${followingId}`);
      } catch (error) {
        this.logger.error(
          `Failed to emit unfollow event for user ${followerId}`,
          error.stack,
        );
        // Don't fail the operation if event emission fails
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Failed to unfollow user ${followingId}`, error.stack);
      throw new InternalServerErrorException('Failed to unfollow user');
    }
  }

  async getFollowers(userId: string) {
    try {
      const followers = await this.prisma.follower.findMany({
        where: { followingId: userId },
        include: { follower: true },
      });

      if (followers.length === 0) {
        this.logger.log(`No followers found for user: ${userId}`);
      }

      return followers;
    } catch (error) {
      this.logger.error(
        `Failed to fetch followers for user: ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch followers');
    }
  }

  async getFollowing(userId: string) {
    try {
      const following = await this.prisma.follower.findMany({
        where: { followerId: userId },
        include: { following: true },
      });

      if (following.length === 0) {
        this.logger.log(`User ${userId} is not following anyone`);
      }

      return following;
    } catch (error) {
      this.logger.error(
        `Failed to fetch following for user: ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch following');
    }
  }
}
