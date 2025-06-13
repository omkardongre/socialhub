import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { env } from '../env';

@Injectable()
export class UserRestService {
  private readonly userServiceBaseUrl = env.USER_SERVICE_URL;

  constructor(private readonly http: HttpService) {}

  async getUserProfile(userId: string, authHeader: string) {
    const url = `${this.userServiceBaseUrl}/profile/${userId}`;
    const response = await firstValueFrom(
      this.http.get(url, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }
}
