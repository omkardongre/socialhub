import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class MediaRestService {
  constructor(private readonly http: HttpService) {}

  async associateMediaToPost(mediaId: string, postId: string): Promise<any> {
    const res = await this.http.axiosRef.patch(
      `${process.env.MEDIA_SERVICE_URL}/media/associate`,
      {
        mediaId,
        postId,
      },
    );
    return res.data;
  }
}
