import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { S3 } from 'aws-sdk';

// Mock the S3 getSignedUrlPromise
const mockGetSignedUrlPromise = jest.fn().mockResolvedValue('http://s3-upload-url.com');
jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn(() => ({
      getSignedUrlPromise: mockGetSignedUrlPromise,
    })),
  };
});

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  const mockUploadService = {
    saveMetadata: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Mock the guard
      .compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUploadUrl', () => {
    it('should return a signed S3 URL', async () => {
      const mockReq = { user: { userId: 'user-1' } };
      const fileType = 'image/jpeg';
      const result = await controller.getUploadUrl(mockReq, fileType);

      expect(S3).toHaveBeenCalled();
      expect(mockGetSignedUrlPromise).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.uploadUrl).toBe('http://s3-upload-url.com');
      expect(result.data.fileUrl).toContain('.jpeg');
    });
  });

  describe('saveMediaMetadata', () => {
    it('should save media metadata', async () => {
      const mockBody = {
        url: 'http://example.com/file.jpg',
        type: 'image/jpeg',
        size: 12345,
        postId: 'post-1',
      };
      const mockResult = { id: '1', ...mockBody, chatMessageId: null, createdAt: new Date(), updatedAt: new Date() };
      mockUploadService.saveMetadata.mockResolvedValue(mockResult);

      const result = await controller.saveMediaMetadata(mockBody);

      expect(service.saveMetadata).toHaveBeenCalledWith(mockBody);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.message).toBe('Media metadata saved successfully');
    });
  });
});
