import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  private s3Client: S3Client;

  constructor(private readonly prisma: PrismaService) {
    this.s3Client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    });

    try {
      const result = await upload.done();
      // The result object for lib-storage Upload has a Location property
      // However, ensure you are checking the correct property based on the specific version/response.
      // For S3 uploads, 'Location' is standard.
      if ('Location' in result && result.Location) {
        return result.Location;
      }
      throw new Error('S3 upload did not return a location.');
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error; // Re-throw the error to be handled by the controller or a global exception filter
    }
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
