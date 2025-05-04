import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UserRestService {
  private readonly userServiceBaseUrl = process.env.USER_SERVICE_URL;

  constructor(private readonly http: HttpService) {}

  async getUserProfile(userId: string): Promise<any> {
    const url = `${this.userServiceBaseUrl}/profile/${userId}`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }

  async getFollowing(userId: string): Promise<any[]> {
    const url = `${this.userServiceBaseUrl}/users/${userId}/following`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }
}
