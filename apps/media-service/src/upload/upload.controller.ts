import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { UploadService } from './upload.service';
import { env } from '../env';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('media')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload-url')
  async getUploadUrl(@Req() req, @Body('fileType') fileType: string) {
    const s3 = new S3({
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
      signatureVersion: 'v4',
    });

    // You may want to use req.user.userId if you have auth
    const fileKey = `${uuid()}.${fileType.split('/')[1]}`;

    const uploadUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: env.S3_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      Expires: 60,
    });

    return {
      success: true,
      data: {
        uploadUrl,
        fileUrl: `https://${env.S3_BUCKET_NAME}.s3.${env.S3_REGION}.amazonaws.com/${fileKey}`,
      },
      message: 'Upload URL generated successfully',
    };
  }

  // Save media metadata after upload
  @UseGuards(JwtAuthGuard)
  @Post('metadata')
  async saveMediaMetadata(
    @Body()
    body: {
      url: string;
      type: string;
      size: number;
      postId?: string;
      chatMessageId?: string;
    },
  ) {
    // You may want to add authentication here
    // Validate input as needed
    const media = await this.uploadService.saveMetadata(body);
    return {
      success: true,
      data: media,
      message: 'Media metadata saved successfully',
    };
  }
}
