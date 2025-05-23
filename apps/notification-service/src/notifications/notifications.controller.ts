import {
  Controller,
  Logger,
  Post,
  HttpCode,
  Body,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { PostCreatedEvent, POST_CREATED } from '@libs/events';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(POST_CREATED)
  public async handlePostCreated(
    @Payload() postCreatedEvent: PostCreatedEvent,
  ): Promise<void> {
    try {
      this.logger.log(
        `Received post_created event: ${JSON.stringify(postCreatedEvent)}`,
      );
      await this.notificationsService.createPostNotification({
        userId: postCreatedEvent.data.userId,
        postId: postCreatedEvent.data.postId,
        content: postCreatedEvent.data.content,
      });
      this.logger.log(
        `Notification created for post ${postCreatedEvent.data.postId}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error processing post_created event: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  @Post('preferences')
  @HttpCode(201)
  async createDefaultPreferences(@Body() data: { userId: string }) {
    try {
      await this.notificationsService.createDefaultPreferences(data.userId);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to create default preferences', error.stack);
      throw new InternalServerErrorException(
        'Failed to create default preferences',
      );
    }
  }
}
