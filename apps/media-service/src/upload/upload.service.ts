import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class UploadService {
  private s3 = new AWS.S3({
    region: process.env.S3_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  });

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
}
