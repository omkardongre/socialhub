import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('UploadService', () => {
  let service: UploadService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveMetadata', () => {
    it('should save media metadata and return the created record', async () => {
      const metadata = {
        url: 'http://example.com/file.jpg',
        type: 'image/jpeg',
        size: 12345,
        postId: 'post-1',
        chatMessageId: 'chat-1',
      };
      const expectedMedia = { id: 'media-1', ...metadata, createdAt: new Date(), updatedAt: new Date() };

      prisma.media.create.mockResolvedValue(expectedMedia as any);

      const result = await service.saveMetadata(metadata);

      expect(prisma.media.create).toHaveBeenCalledWith({ data: metadata });
      expect(result).toEqual(expectedMedia);
    });
  });
});
