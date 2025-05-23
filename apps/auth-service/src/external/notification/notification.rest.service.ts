import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class NotificationRestService {
  private readonly notificationServiceUrl =
    process.env.NOTIFICATION_SERVICE_URL;

  constructor(private readonly http: HttpService) {}

  async createDefaultPreferences(userId: string) {
    const url = `${this.notificationServiceUrl}/notifications/preferences`;
    const response = await firstValueFrom(this.http.post(url, { userId }));
    return response.data;
  }
}
