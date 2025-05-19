import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PostCreatedEvent } from '@app/event-bus/types/events';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  @EventPattern('post.created')
  handlePostCreated(@Payload() event: PostCreatedEvent) {
    this.logger.log(`Received post.created event for post ID: ${event.postId}`);

    // Here you would typically:
    // 1. Transform the event data
    // 2. Save a notification to your database
    // Example (if you have Prisma set up):
    // await this.prismaService.notification.create({
    //   data: {
    //     type: 'POST_CREATED',
    //     receiverId: event.userId,
    //     entityId: event.postId,
    //     content: `New post created: ${event.content.slice(0, 50)}...`
    //   }
    // });
  }

  // Add other event handlers as needed
  // Example:
  // @EventPattern('user.followed')
  // async handleUserFollowed(@Payload() event: UserFollowedEvent) {
  //   // Handle user follow event
  // }
}
