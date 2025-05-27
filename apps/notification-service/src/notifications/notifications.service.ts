import {
  Inject,
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, EntityType } from '../../prisma/types';
import { Queue } from 'bull';
import { NotificationJob } from './jobs/notification-job.interface';
import { UserFollowedEventData } from '@libs/events/user-followed.event';
import { PostCreatedEventData } from '@libs/events/post-created.event';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notification-queue')
    private readonly notificationQueue: Queue,
  ) {}

  async createDefaultPreferences(userId: string): Promise<void> {
    try {
      await this.prisma.notificationPreference.create({
        data: {
          userId,
          followNotifications: true,
          likeNotifications: true,
          commentNotifications: true,
          mentionNotifications: true,
          systemNotifications: true,
          emailNotifications: false,
          pushNotifications: false,
          postNotifications: true,
        },
      });
      this.logger.log(`Created default preferences for user: ${userId}`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.debug(`Preferences already exist for user: ${userId}`);
          return;
        }
        if (error.code === 'P2003') {
          this.logger.warn(
            `User not found when creating preferences: ${userId}`,
          );
          throw new NotFoundException('User not found');
        }
      }

      this.logger.error(
        `Failed to create default preferences for user: ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to create notification preferences',
      );
    }
  }

  async createPostNotification(postData: PostCreatedEventData): Promise<void> {
    try {
      const preferences = await this.prisma.notificationPreference.findUnique({
        where: { userId: postData.userId },
      });

      if (!preferences) {
        this.logger.warn(`No preferences found for user: ${postData.userId}`);
        await this.createDefaultPreferences(postData.userId);
        return;
      }

      if (preferences.postNotifications === false) {
        this.logger.debug(
          `Post notifications disabled for user: ${postData.userId}`,
        );
        return;
      }

      await this.prisma.notification.create({
        data: {
          receiverId: postData.userId,
          type: NotificationType.POST,
          entityType: EntityType.POST,
          entityId: postData.postId,
          content: `New post: ${postData.content.substring(0, 50)}${postData.content.length > 50 ? '...' : ''}`,
        },
      });

      this.logger.log(`Created notification for post ${postData.postId}`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          this.logger.warn(`Invalid user or post reference`);
          throw new BadRequestException('Invalid user or post reference');
        }
      }

      this.logger.error(
        `Error creating post notification for user ${postData.userId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to create post notification',
      );
    }
  }

  async enqueueNotification(jobData: NotificationJob) {
    try {
      if (!jobData.userEmail) {
        this.logger.warn('Attempted to enqueue notification without email');
        return;
      }
      await this.notificationQueue.add('send-notification', {
        ...jobData,
      });
      this.logger.log(`Enqueued notification for user ${jobData.userEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to enqueue notification: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to enqueue notification');
    }
  }

  async handleFollowEvent(followData: UserFollowedEventData) {
    try {
      let preferences = await this.prisma.notificationPreference.findUnique({
        where: { userId: followData.followedId },
      });

      if (!preferences) {
        this.logger.debug(
          `No preferences found for user: ${followData.followedId}, creating defaults`,
        );
        await this.createDefaultPreferences(followData.followedId);
        preferences = await this.prisma.notificationPreference.findUnique({
          where: { userId: followData.followedId },
        });
      }

      if (!preferences) {
        this.logger.warn(
          `No preferences found for user: ${followData.followedId}`,
        );
        return;
      }

      if (preferences.followNotifications === false) {
        this.logger.debug(
          `Follow notifications disabled for user: ${followData.followedId}`,
        );
        return;
      }

      // Create notification in database
      const notification = await this.prisma.notification.create({
        data: {
          receiverId: followData.followedId,
          senderId: followData.followerId,
          type: NotificationType.FOLLOW,
          entityType: EntityType.USER,
          entityId: followData.followerId,
          content: `User started following you`,
        },
      });

      // Enqueue email notification
      await this.enqueueNotification({
        userEmail: followData.followedEmail,
        type: 'USER_FOLLOWED',
        payload: {
          followerId: followData.followerId,
          followerName: followData.followerName,
          followedAt: followData.followedAt,
        },
      });

      this.logger.log(
        `Created and enqueued follow notification for user ${followData.followedId} from ${followData.followerId}`,
      );

      return notification;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          this.logger.warn(`Invalid user reference in follow event`);
          // Don't throw to prevent message requeue for invalid data
          return;
        }
      }

      this.logger.error(
        `Error creating follow notification: ${error.message}`,
        error.stack,
      );
      // Don't rethrow to prevent message requeue
    }
  }
}
