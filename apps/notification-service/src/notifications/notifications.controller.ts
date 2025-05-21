import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PostCreatedEventDto } from './dto/post-created-event.dto';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  @EventPattern('post_created')
  public async handlePostCreated(
    @Payload() data: PostCreatedEventDto,
  ): Promise<void> {
    try {
      this.logger.log(`Received post_created event: ${JSON.stringify(data)}`);

      // Simulate async operation
      await new Promise<void>((resolve) => setTimeout(resolve, 100));

      // TODO: Save notification to database
      // TODO: Send push/email notification if enabled in user preferences

      this.logger.log(`Notification created for post ${data.postId}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error processing post_created event: ${errorMessage}`,
        errorStack,
      );
    }
  }
}
