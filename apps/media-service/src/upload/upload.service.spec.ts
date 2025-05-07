import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

// Mock AWS SDK v3 classes
const mockUploadDone = jest.fn();
const mockS3ClientInstance = { send: jest.fn() }; // Mock instance for S3Client

jest.mock('@aws-sdk/lib-storage', () => ({
  __esModule: true,
  Upload: jest.fn().mockImplementation(() => ({
    done: mockUploadDone,
  })),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  __esModule: true,
  S3Client: jest.fn().mockImplementation(() => mockS3ClientInstance),
}));

describe('UploadService', () => {
  let service: UploadService;
  let prisma: DeepMocked<PrismaService>;
  let MockedUpload: jest.MockedClass<typeof Upload>;
  let MockedS3Client: jest.MockedClass<typeof S3Client>;

  // Store original process.env values
  const originalEnv = process.env;

  beforeAll(() => {
    // Set dummy env variables for S3Client instantiation for all tests in this suite
    process.env = {
      ...originalEnv,
      S3_REGION: 'test-region',
      S3_ACCESS_KEY: 'test-access-key-id',
      S3_SECRET_KEY: 'test-secret-access-key',
      S3_BUCKET_NAME: 'test-bucket-name',
    };
  });

  afterAll(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  beforeEach(async () => {
    // Reset mocks before each test to ensure clean state
    mockUploadDone.mockReset();
    // Use the typed mock variables defined in the suite scope
    if (MockedUpload) MockedUpload.mockClear();
    if (MockedS3Client) MockedS3Client.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: PrismaService,
          useValue: createMock<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    prisma = module.get(PrismaService);
    MockedUpload = Upload as jest.MockedClass<typeof Upload>;
    MockedS3Client = S3Client as jest.MockedClass<typeof S3Client>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should instantiate S3Client with environment variables', () => {
      // Service is instantiated in beforeEach, so S3Client constructor is called there
      expect(MockedS3Client).toHaveBeenCalledTimes(1);
      expect(MockedS3Client).toHaveBeenCalledWith({
        region: 'test-region',
        credentials: {
          accessKeyId: 'test-access-key-id',
          secretAccessKey: 'test-secret-access-key',
        },
      });
    });
  });

  describe('uploadFile', () => {
    const mockFile = {
      originalname: 'testfile.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('some image data'),
      size: 1000,
    } as Express.Multer.File;

    it('should upload a file to S3 and return its location', async () => {
      const mockLocation = 'https://test-bucket-name.s3.test-region.amazonaws.com/testfile.jpg';
      mockUploadDone.mockResolvedValue({ Location: mockLocation });

      const result = await service.uploadFile(mockFile);

      expect(MockedUpload).toHaveBeenCalledTimes(1);
      expect(MockedUpload).toHaveBeenCalledWith({
        client: mockS3ClientInstance, // Ensure the mocked S3Client instance is passed
        params: {
          Bucket: 'test-bucket-name',
          Key: mockFile.originalname,
          Body: mockFile.buffer,
          ContentType: mockFile.mimetype,
        },
      });
      expect(mockUploadDone).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockLocation);
    });

    it('should throw an error if S3 upload fails', async () => {
      const s3Error = new Error('S3 upload failed miserably');
      mockUploadDone.mockRejectedValue(s3Error);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.uploadFile(mockFile)).rejects.toThrow(s3Error);
      expect(MockedUpload).toHaveBeenCalledTimes(1);
      expect(mockUploadDone).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error uploading to S3:', s3Error);

      consoleErrorSpy.mockRestore();
    });

    it('should throw an error if S3 response does not contain Location', async () => {
      mockUploadDone.mockResolvedValue({ SomeOtherProperty: 'value' }); // No Location
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const expectedErrorMsg = 'S3 upload did not return a location.';

      await expect(service.uploadFile(mockFile)).rejects.toThrow(expectedErrorMsg);
      expect(MockedUpload).toHaveBeenCalledTimes(1);
      expect(mockUploadDone).toHaveBeenCalledTimes(1);
      // Check that console.error was called with an Error object whose message is the expected one
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error uploading to S3:',
        expect.objectContaining({ message: expectedErrorMsg }),
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('saveMetadata', () => {
    it('should save media metadata using Prisma', async () => {
      const metadataInput = {
        url: 'https://test-bucket-name.s3.test-region.amazonaws.com/testfile.jpg',
        type: 'image/jpeg',
        size: 1000,
        postId: 'post123',
      };
      const expectedSavedMedia = {
        id: 'media123',
        ...metadataInput,
        createdAt: new Date(),
        updatedAt: new Date(), // Assuming your Prisma model has updatedAt
      };

      // Mock Prisma's media.create method
      (prisma.media.create as jest.Mock).mockResolvedValue(expectedSavedMedia as any);

      const result = await service.saveMetadata(metadataInput);

      expect(prisma.media.create).toHaveBeenCalledTimes(1);
      expect(prisma.media.create).toHaveBeenCalledWith({ data: metadataInput });
      expect(result).toEqual(expectedSavedMedia);
    });
  });
});
