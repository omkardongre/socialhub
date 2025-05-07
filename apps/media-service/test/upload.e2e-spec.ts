import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module'; // Main AppModule
import { PrismaService } from '../src/prisma/prisma.service';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

describe('UploadController (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let s3Client: S3Client;
  let testBucketName: string;
  let testS3Region: string;

  const testFilePath = path.join(__dirname, 'test-upload-file.txt');
  let uploadedFileKey: string | null = null;
  let createdMediaId: string | null = null;

  beforeAll(async () => {
    // Create a dummy file for upload
    fs.writeFileSync(testFilePath, 'This is a test file for E2E upload.');

    // Ensure environment variables are loaded for S3 client (Jest config handles .env.test.e2e)
    testBucketName = process.env.S3_BUCKET_NAME!;
    testS3Region = process.env.S3_REGION!;

    if (
      !testBucketName ||
      !testS3Region ||
      !process.env.S3_ACCESS_KEY ||
      !process.env.S3_SECRET_KEY
    ) {
      throw new Error(
        'Missing S3 configuration in .env.test.e2e for E2E tests.',
      );
    }
    if (!process.env.DATABASE_URL) {
      throw new Error('Missing DATABASE_URL in .env.test.e2e for E2E tests.');
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    s3Client = new S3Client({
      region: testS3Region,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
    });
  });

  afterAll(async () => {
    // Clean up dummy file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    await app.close();
  });

  // Separate afterEach for cleaning up resources created by each test
  afterEach(async () => {
    if (createdMediaId) {
      try {
        await prisma.media.delete({ where: { id: createdMediaId } });
      } catch (error) {
        console.error('Error cleaning up media record:', error);
      }
      createdMediaId = null;
    }
    if (uploadedFileKey && testBucketName) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: testBucketName,
            Key: uploadedFileKey,
          }),
        );
      } catch (error) {
        console.error('Error cleaning up S3 object:', error);
      }
      uploadedFileKey = null;
    }
  });

  describe('/upload (POST)', () => {
    it('should upload a file to S3, save metadata to DB, and return success', async () => {
      const testPostId = `e2e-post-${randomBytes(4).toString('hex')}`;
      const originalFileName = path.basename(testFilePath);

      const response = await request(app.getHttpServer())
        .post('/upload')
        .attach('file', testFilePath) // 'file' is the field name expected by FileInterceptor
        .field('postId', testPostId)
        .expect(201); // HTTP 201 Created

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.message).toEqual(
        'File uploaded and metadata saved successfully',
      );
      expect(response.body.data).toBeDefined();

      const media = response.body.data;
      createdMediaId = media.id; // Store for cleanup
      uploadedFileKey = media.url.substring(media.url.lastIndexOf('/') + 1);

      expect(media.id).toEqual(expect.any(String));
      expect(media.url).toContain(testBucketName);
      expect(media.url).toContain(originalFileName); // S3 key should match original file name
      expect(media.type).toEqual('text/plain'); // Based on .txt file
      expect(media.size).toEqual(expect.any(Number));
      expect(media.postId).toEqual(testPostId);

      // Verify in database
      const dbMedia = await prisma.media.findUnique({
        where: { id: media.id },
      });
      expect(dbMedia).not.toBeNull();
      expect(dbMedia?.url).toEqual(media.url);
      expect(dbMedia?.postId).toEqual(testPostId);

      // Small delay to ensure S3 object is available before potential cleanup in afterEach
      // This is sometimes needed if tests run extremely fast.
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    it('should return 400 if no file is provided', async () => {
      const testPostId = `e2e-post-no-file-${randomBytes(4).toString('hex')}`;
      const response = await request(app.getHttpServer())
        .post('/upload')
        .field('postId', testPostId)
        .expect(400); // HTTP 400 Bad Request

      expect(response.body).toBeDefined();
      expect(response.body.message).toEqual('File is required.');
      // Multer might throw "Unexpected field" if it expects 'file' but gets only 'postId'.
      // Or, if no multipart headers, it could be a different validation error.
      // Let's refine this assertion after seeing the actual error.
      // For now, checking for "Unexpected field" or a general bad request message.
      // A more specific check might be needed based on how NestJS/Multer formats the error
      // For instance, if a custom exception filter is in place, the message might be different.
      // The default behavior for FileInterceptor without a file might be "Unexpected end of form" or "Multipart: Boundary not found"
      // but since we are sending other fields, "Unexpected field" is more likely if it doesn't find 'file'.
    });
  });
});
