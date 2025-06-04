import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UserRestService {
  private readonly logger = new Logger(UserRestService.name);
  private readonly userServiceBaseUrl = process.env.USER_SERVICE_URL;

  constructor(private readonly http: HttpService) {}

  async getUserProfile(userId: string, authHeader: string): Promise<any> {
    const url = `${this.userServiceBaseUrl}/profile/${userId}`;
    this.logger.debug(`Fetching user profile for ${userId}`);
    try {
      const { data } = await firstValueFrom(
        this.http.get(url, { headers: { Authorization: authHeader } }),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch user profile for ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getFollowing(userId: string, authHeader: string): Promise<any[]> {
    const url = `${this.userServiceBaseUrl}/users/${userId}/following`;
    this.logger.debug(`Fetching following users for ${userId}`);
    try {
      const { data: response } = await firstValueFrom(
        this.http.get(url, { headers: { Authorization: authHeader } }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch following users for ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
