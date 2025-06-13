import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { env } from '../env';

@Injectable()
export class SendGridService {
  private readonly logger = new Logger(SendGridService.name);
  private readonly fromEmail: string;

  constructor() {
    const apiKey = env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }
    this.fromEmail = env.FROM_EMAIL;
    sgMail.setApiKey(apiKey);
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    try {
      const msg = {
        to,
        from: this.fromEmail,
        subject,
        text,
        ...(html && { html }), // Include HTML content if provided
      };

      this.logger.debug(`Sending email to: ${to}, Subject: ${subject}`);
      await sgMail.send(msg);
      this.logger.log(`Email sent successfully to: ${to}`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
