import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class UserRestService {
  private readonly userServiceBaseUrl = process.env.USER_SERVICE_URL;

  constructor(private readonly http: HttpService) {}

  async createUserProfile(createProfileDto: CreateProfileDto) {
    const url = `${this.userServiceBaseUrl}/profile`;
    const response = await firstValueFrom(
      this.http.post(url, createProfileDto),
    );
    return response.data;
  }
}
