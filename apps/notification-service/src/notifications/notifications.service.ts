import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

interface PostCreatedEvent {
  postId: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // Placeholder for future event handling
  @EventPattern('post.created')
  handlePostCreated(@Payload() event: PostCreatedEvent) {
    this.logger.log(`Received post.created event for post ID: ${event.postId}`);
  }
}