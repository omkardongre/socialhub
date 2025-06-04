import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class NotificationRestService {
  private readonly logger = new Logger(NotificationRestService.name);
  private readonly notificationServiceUrl =
    process.env.NOTIFICATION_SERVICE_URL;

  constructor(private readonly http: HttpService) {}

  async createDefaultPreferences(userId: string) {
    const url = `${this.notificationServiceUrl}/notifications/preferences`;
    this.logger.debug(`Creating default notification preferences for user ${userId}`);
    try {
      const response = await firstValueFrom(this.http.post(url, { userId }));
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create default notification preferences for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
