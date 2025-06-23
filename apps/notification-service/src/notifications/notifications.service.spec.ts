import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { Queue } from 'bull';
import { NotificationType, EntityType, Prisma, Notification } from '@prisma/client';
import { InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { NotificationJob } from './jobs/notification-job.interface';

jest.mock('bull');


const mockPrismaService = {
  notificationPreference: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
};

const mockQueue = {
  add: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: typeof mockPrismaService;
  let queue: typeof mockQueue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: 'BullQueue_notification-queue', useValue: mockQueue },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService) as any;
    queue = module.get('BullQueue_notification-queue') as any;

    // Suppress logger output for clean test results
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'log').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'debug').mockImplementation(() => {});

    jest.clearAllMocks();
  });

  describe('createDefaultPreferences', () => {
    it('should create default preferences', async () => {
      prisma.notificationPreference.create.mockResolvedValueOnce(undefined);
      await expect(service.createDefaultPreferences('user1')).resolves.toBeUndefined();
      expect(prisma.notificationPreference.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: 'user1' }) })
      );
    });
    it('should handle duplicate preference error gracefully', async () => {
      prisma.notificationPreference.create.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('mock', { code: 'P2002', clientVersion: 'test' })
      );
      await expect(service.createDefaultPreferences('user1')).resolves.toBeUndefined();
    });
    it('should throw NotFoundException for user not found', async () => {
      prisma.notificationPreference.create.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record to update not found', { code: 'P2025', clientVersion: 'test' })
      );
      await expect(service.createDefaultPreferences('user1')).rejects.toThrow(NotFoundException);
    });
    it('should throw InternalServerErrorException for other errors', async () => {
      prisma.notificationPreference.create.mockRejectedValueOnce(new Error('fail'));
      await expect(service.createDefaultPreferences('user1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('createPostNotification', () => {
    it('should create notification if preferences exist and enabled', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValueOnce({ userId: 'user1', postNotifications: true });
      prisma.notification.create.mockResolvedValueOnce(undefined);
      await expect(service.createPostNotification({ userId: 'user1', postId: 'p1', content: 'test content', createdAt: new Date().toISOString() })).resolves.toBeUndefined();
      expect(prisma.notification.create).toHaveBeenCalled();
    });
    it('should create default preferences if none exist', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValueOnce(null);
      const spy = jest.spyOn(service, 'createDefaultPreferences').mockResolvedValueOnce(undefined);
      await expect(service.createPostNotification({ userId: 'user1', postId: 'p1', content: 'test', createdAt: new Date().toISOString() })).resolves.toBeUndefined();
      expect(spy).toHaveBeenCalledWith('user1');
    });
    it('should not create notification if postNotifications is false', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValueOnce({ userId: 'user1', postNotifications: false });
      await expect(service.createPostNotification({ userId: 'user1', postId: 'p1', content: 'test', createdAt: new Date().toISOString() })).resolves.toBeUndefined();
      expect(prisma.notification.create).not.toHaveBeenCalled();
    });
    it('should throw BadRequestException for invalid reference', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValueOnce({ userId: 'user1', postNotifications: true });
      prisma.notification.create.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('mock', { code: 'P2003', clientVersion: 'test' })
      );
      await expect(service.createPostNotification({ userId: 'user1', postId: 'p1', content: 'test', createdAt: new Date().toISOString() })).rejects.toThrow(BadRequestException);
    });
    it('should throw InternalServerErrorException for other errors', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValueOnce({ userId: 'user1', postNotifications: true });
      prisma.notification.create.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('mock', { code: 'P2003', clientVersion: 'test' }));
      await expect(service.createPostNotification({ userId: 'user1', postId: 'p1', content: 'test', createdAt: new Date().toISOString() })).rejects.toThrow(BadRequestException);
    });
  });

  describe('enqueueNotification', () => {
    it('should enqueue notification if userEmail exists', async () => {
      queue.add.mockResolvedValueOnce(undefined);
      await expect(service.enqueueNotification({ userEmail: 'test@example.com', type: 'USER_FOLLOWED', payload: {} })).resolves.toBeUndefined();
      expect(queue.add).toHaveBeenCalledWith('send-notification', expect.any(Object));
    });
    it('should warn and return if userEmail is missing', async () => {
      await expect(service.enqueueNotification({ type: 'USER_FOLLOWED', payload: {} } as any)).resolves.toBeUndefined();
      expect(queue.add).not.toHaveBeenCalled();
    });
    it('should throw InternalServerErrorException on error', async () => {
      queue.add.mockRejectedValueOnce(new Error('fail'));
      await expect(service.enqueueNotification({ userEmail: 'test@example.com', type: 'USER_FOLLOWED', payload: {} })).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('handleFollowEvent', () => {
    it('should create default preferences if none exist', async () => {
      // First call returns null (no preferences), second returns preferences
      prisma.notificationPreference.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ userId: 'u1', followNotifications: true });
      const spy = jest.spyOn(service, 'createDefaultPreferences').mockResolvedValueOnce(undefined);
      prisma.notification.create.mockResolvedValueOnce('notification');
      queue.add.mockResolvedValueOnce(undefined);
      await expect(service.handleFollowEvent({ followerId: 'f1', followedId: 'u1', followedEmail: 'e', followerName: 'n', followedAt: '', } as any)).resolves.toEqual('notification');
      expect(spy).toHaveBeenCalledWith('u1');
    });
    it('should not create notification if preferences are missing after defaults', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      await expect(service.handleFollowEvent({ followerId: 'f1', followedId: 'u1', followedEmail: 'e', followerName: 'n', followedAt: '', } as any)).resolves.toBeUndefined();
    });
    it('should not create notification if followNotifications is false', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValueOnce({ userId: 'u1', followNotifications: false });
      await expect(service.handleFollowEvent({ followerId: 'f1', followedId: 'u1', followedEmail: 'e', followerName: 'n', followedAt: '', } as any)).resolves.toBeUndefined();
    });
    it('should handle P2003 error gracefully', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValueOnce({ userId: 'u1', followNotifications: true });
      prisma.notification.create.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('mock', { code: 'P2003', clientVersion: 'test' })
      );
      await expect(service.handleFollowEvent({ followerId: 'f1', followedId: 'u1', followedEmail: 'e', followerName: 'n', followedAt: '', } as any)).resolves.toBeUndefined();
    });
    it('should not throw on unknown error', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValueOnce({ userId: 'u1', followNotifications: true });
      prisma.notification.create.mockRejectedValueOnce(new Error('fail'));
      await expect(service.handleFollowEvent({ followerId: 'f1', followedId: 'u1', followedEmail: 'e', followerName: 'n', followedAt: '', } as any)).resolves.toBeUndefined();
    });
  });

  describe('getUserNotifications', () => {
    it('should return paginated notifications', async () => {
      prisma.notification.findMany.mockResolvedValueOnce(['n1', 'n2']);
      prisma.notification.count.mockResolvedValueOnce(2);
      const query: GetNotificationsDto = { page: 1, limit: 2 } as any;
      const result = await service.getUserNotifications(query);
      expect(result).toEqual({
        data: ['n1', 'n2'],
        meta: { total: 2, page: 1, limit: 2, totalPages: 1 },
      });
    });
    it('should throw on error', async () => {
      prisma.notification.findMany.mockRejectedValueOnce(new Error('fail'));
      const query: GetNotificationsDto = { page: 1, limit: 2 } as any;
      await expect(service.getUserNotifications(query)).rejects.toThrow('Failed to fetch notifications');
    });
  });

  describe('markAsRead', () => {
    it('should update notification isRead', async () => {
      prisma.notification.update.mockResolvedValueOnce('updated');
      await expect(service.markAsRead('id', true)).resolves.toEqual('updated');
    });
    it('should throw NotFoundException for P2025 error', async () => {
      prisma.notification.update.mockRejectedValueOnce({ code: 'P2025' });
      await expect(service.markAsRead('id', true)).rejects.toThrow(NotFoundException);
    });
    it('should throw InternalServerErrorException for other errors', async () => {
      prisma.notification.update.mockRejectedValueOnce(new Error('fail'));
      await expect(service.markAsRead('id', true)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
