import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, EntityType } from '../../prisma/types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createDefaultPreferences(userId: string) {
    try {
      await this.prisma.notificationPreference.create({
        data: {
          userId,
          // All notifications enabled by default
          followNotifications: true,
          likeNotifications: true,
          commentNotifications: true,
          mentionNotifications: true,
          systemNotifications: true,
          emailNotifications: false,
          pushNotifications: false,
        },
      });
    } catch (error) {
      // Handle case where preferences already exist
      if (error.code !== 'P2002') {
        // Unique constraint failed
        throw error;
      }
    }
  }

  async createPostNotification(postData: {
    userId: string;
    postId: string;
    content: string;
  }): Promise<void> {
    try {
      const preferences = await this.prisma.notificationPreference.findUnique({
        where: { userId: postData.userId },
      });

      if (preferences?.postNotifications !== false) {
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
      }
    } catch (error) {
      this.logger.error(
        `Error creating notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
