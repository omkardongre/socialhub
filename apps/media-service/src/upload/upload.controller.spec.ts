import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { Express } from 'express';
import { DeepMocked, createMock } from '@golevelup/ts-jest';

describe('UploadController', () => {
  let controller: UploadController;
  let service: DeepMocked<UploadService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
    })
      .useMocker(createMock)
      .compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get(UploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('should upload a file and save metadata', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 4,
      } as Express.Multer.File;

      const mockBody = { postId: 'testPostId' };
      const mockFileUrl = 'http://s3.com/test.jpg';
      const mockMediaMetadata = {
        id: 'mediaId',
        url: mockFileUrl,
        type: mockFile.mimetype,
        size: mockFile.size,
        postId: mockBody.postId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.uploadFile.mockResolvedValue(mockFileUrl);
      service.saveMetadata.mockResolvedValue(mockMediaMetadata);

      const result = await controller.upload(mockFile, mockBody);

      expect(service.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(service.saveMetadata).toHaveBeenCalledWith({
        url: mockFileUrl,
        type: mockFile.mimetype,
        size: mockFile.size,
        postId: mockBody.postId,
      });
      expect(result).toEqual({
        success: true,
        data: mockMediaMetadata,
        message: 'File uploaded and metadata saved successfully',
      });
    });

    it('should upload a file and save metadata without postId', async () => {
      const mockFile = {
        originalname: 'test.png',
        mimetype: 'image/png',
        buffer: Buffer.from('another test'),
        size: 12,
      } as Express.Multer.File;

      const mockBody = {}; // No postId
      const mockFileUrl = 'http://s3.com/test.png';
      const mockMediaMetadata = {
        id: 'mediaId2',
        url: mockFileUrl,
        type: mockFile.mimetype,
        size: mockFile.size,
        postId: null, // Changed from undefined to null
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.uploadFile.mockResolvedValue(mockFileUrl);
      service.saveMetadata.mockResolvedValue(mockMediaMetadata);

      const result = await controller.upload(mockFile, mockBody);

      expect(service.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(service.saveMetadata).toHaveBeenCalledWith({
        url: mockFileUrl,
        type: mockFile.mimetype,
        size: mockFile.size,
        postId: undefined, // Explicitly check for undefined
      });
      expect(result).toEqual({
        success: true,
        data: mockMediaMetadata,
        message: 'File uploaded and metadata saved successfully',
      });
    });
  });
});
