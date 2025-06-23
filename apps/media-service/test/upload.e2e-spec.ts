import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { S3 } from 'aws-sdk';

// Mock the S3 getSignedUrlPromise
const mockGetSignedUrlPromise = jest.fn().mockResolvedValue('http://s3-upload-url.com');

// Mock the entire aws-sdk
jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn(() => ({
      getSignedUrlPromise: mockGetSignedUrlPromise,
    })),
  };
});

describe('UploadController (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Mock the guard to always allow access
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up database before tests
    await prisma.media.deleteMany({});
  });

  afterAll(async () => {
    // Clean up database after tests
    await prisma.media.deleteMany({});
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('/media/upload-url (POST)', () => {
    it('should return a signed URL for file upload', async () => {
      const fileType = 'image/png';
      const response = await request(app.getHttpServer())
        .post('/media/upload-url')
        .send({ fileType })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.uploadUrl).toBe('http://s3-upload-url.com');
      expect(response.body.data.fileUrl).toContain('.png');
      expect(S3).toHaveBeenCalled();
      expect(mockGetSignedUrlPromise).toHaveBeenCalledWith('putObject', expect.any(Object));
    });
  });

  describe('/media/metadata (POST)', () => {
    it('should save media metadata to the database', async () => {
      const metadata = {
        url: 'http://example.com/image.png',
        type: 'image/png',
        size: 54321,
        postId: 'some-post-id',
      };

      const response = await request(app.getHttpServer())
        .post('/media/metadata')
        .send(metadata)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toBe(metadata.url);
      expect(response.body.data.postId).toBe(metadata.postId);

      // Verify in database
      const dbMedia = await prisma.media.findUnique({
        where: { id: response.body.data.id },
      });
      expect(dbMedia).not.toBeNull();
      expect(dbMedia?.url).toEqual(metadata.url);
    });
  });
});
