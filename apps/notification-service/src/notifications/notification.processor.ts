import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { NotificationJob } from './jobs/notification-job.interface';
import { SendGridService } from '../sendgrid/sendgrid.service';

@Processor('notification-queue')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly sendGridService: SendGridService) {}

  @Process('send-notification')
  async handleSendNotification(job: Job<NotificationJob>) {
    const { userEmail, type, payload } = job.data;
    try {
      const subject = this.getSubject(type, payload);
      const text = this.getTextContent(type, payload);
      const html = this.getHtmlContent(type, payload);

      this.logger.log(
        `[📧 Sending Email] To: ${userEmail}, Subject: ${subject}`,
      );

      await this.sendGridService.sendEmail(userEmail, subject, text, html);

      this.logger.log(`[✅ Email Sent] To: ${userEmail}, Subject: ${subject}`);

      return { success: true, email: userEmail, type };
    } catch (error) {
      this.logger.error(
        `Failed to process notification job: ${error.message}`,
        error.stack,
      );
      throw error; // This will make Bull retry the job
    }
  }

  private getSubject(type: string, payload: any): string {
    switch (type) {
      case 'USER_FOLLOWED':
        return `New Follower: ${payload.followerName || 'Someone'}`;
      case 'POST_CREATED':
        return 'New Post in Your Feed';
      case 'COMMENT_ADDED':
        return 'New Comment on Your Post';
      case 'LIKE_ADDED':
        return 'New Like on Your Post';
      default:
        return 'New Notification';
    }
  }

  private getTextContent(type: string, payload: any): string {
    switch (type) {
      case 'USER_FOLLOWED':
        return `User ${payload.followerName || 'Someone'} has started following you on SocialHub.`;
      case 'POST_CREATED':
        return 'A new post has been created in your feed.';
      case 'COMMENT_ADDED':
        return 'Someone has commented on your post.';
      case 'LIKE_ADDED':
        return 'Someone has liked your post.';
      default:
        return 'You have a new notification.';
    }
  }

  private getHtmlContent(type: string, payload: any): string {
    const text = this.getTextContent(type, payload);
    const subject = this.getSubject(type, payload);

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4f46e5; padding: 20px; color: white; text-align: center;">
          <h1>SocialHub</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>${subject}</h2>
          <p>${text}</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 0.9em;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 0.8em;">
          ${new Date().getFullYear()} SocialHub. All rights reserved.
        </div>
      </div>
    `;
  }

  private getBody(type: string, payload: any): string {
    switch (type) {
      case 'POST_CREATED':
        return `A new post was created by ${payload.authorName || 'a user'}: "${payload.content?.substring(0, 100) || ''}..."`;
      case 'USER_FOLLOWED':
        return `${payload.followerName || 'Someone'} started following you.`;
      case 'COMMENT_ADDED':
        return `${payload.commenterName || 'A user'} commented: "${payload.comment?.substring(0, 100) || ''}..."`;
      case 'LIKE_ADDED':
        return `${payload.likerName || 'Someone'} liked your post.`;
      default:
        return 'You have a new activity in your account.';
    }
  }
}
