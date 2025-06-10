import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMetadata(data: {
    url: string;
    type: string;
    size: number;
    postId?: string;
    chatMessageId?: string;
  }) {
    return this.prisma.media.create({ data });
  }
}
