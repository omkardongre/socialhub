import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  private s3 = new AWS.S3({
    region: process.env.S3_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  });

  constructor(private readonly prisma: PrismaService) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const uploadResult = await this.s3
      .upload({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    return uploadResult.Location;
  }

  async saveMetadata(data: {
    url: string;
    type: string;
    size: number;
    postId?: string;
  }) {
    return this.prisma.media.create({ data });
  }
}
