import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { InternalServerErrorException } from '@nestjs/common';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { MarkReadDto } from './dto/mark-read.dto';

const mockNotificationsService = {
  createPostNotification: jest.fn(),
  createDefaultPreferences: jest.fn(),
  handleFollowEvent: jest.fn(),
  getUserNotifications: jest.fn(),
  markAsRead: jest.fn(),
  enqueueNotification: jest.fn(),
};

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: typeof mockNotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService) as any;
    jest.clearAllMocks();
  });

  describe('handlePostCreated', () => {
    it('should create a post notification', async () => {
      const event = {
        data: {
          userId: 'user1',
          postId: 'post1',
          content: 'test',
          createdAt: new Date().toISOString(),
        },
      };
      await controller.handlePostCreated(event as any);
      expect(service.createPostNotification).toHaveBeenCalledWith({
        userId: 'user1',
        postId: 'post1',
        content: 'test',
        createdAt: event.data.createdAt,
      });
    });
    it('should handle errors gracefully', async () => {
      service.createPostNotification.mockRejectedValueOnce(new Error('fail'));
      const event = {
        data: {
          userId: 'user1',
          postId: 'post1',
          content: 'test',
          createdAt: new Date().toISOString(),
        },
      };
      await expect(controller.handlePostCreated(event as any)).resolves.toBeUndefined();
    });
  });

  describe('createDefaultPreferences', () => {
    it('should create default preferences', async () => {
      service.createDefaultPreferences.mockResolvedValueOnce(undefined);
      await expect(controller.createDefaultPreferences({ userId: 'user1' })).resolves.toEqual({ success: true });
      expect(service.createDefaultPreferences).toHaveBeenCalledWith('user1');
    });
    it('should throw InternalServerErrorException on failure', async () => {
      service.createDefaultPreferences.mockRejectedValueOnce(new Error('fail'));
      await expect(controller.createDefaultPreferences({ userId: 'user1' })).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('handleFollow', () => {
    it('should handle user followed event', async () => {
      const event = { data: { followerId: 'f1', followedId: 'u1' } };
      await controller.handleFollow(event as any);
      expect(service.handleFollowEvent).toHaveBeenCalledWith(event.data);
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      expect(controller.health()).toEqual({ success: true, data: 'ok', message: 'Notification service is healthy' });
    });
  });

  describe('testQueue', () => {
    it('should enqueue a notification', async () => {
      service.enqueueNotification.mockResolvedValueOnce(undefined);
      await expect(controller.testQueue()).resolves.toEqual({ success: true });
      expect(service.enqueueNotification).toHaveBeenCalledWith(
        expect.objectContaining({ userEmail: 'omkardongre5@gmail.com', type: 'USER_FOLLOWED' })
      );
    });
  });

  describe('getNotifications', () => {
    it('should get user notifications', async () => {
      const dto: GetNotificationsDto = { userId: 'user1' } as any;
      service.getUserNotifications.mockResolvedValueOnce(['notif1']);
      await expect(controller.getNotifications(dto)).resolves.toEqual(['notif1']);
      expect(service.getUserNotifications).toHaveBeenCalledWith(dto);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const id = 'notif1';
      const body: MarkReadDto = { isRead: true };
      service.markAsRead.mockResolvedValueOnce('updated');
      await expect(controller.markAsRead(id, body)).resolves.toEqual('updated');
      expect(service.markAsRead).toHaveBeenCalledWith(id, body.isRead);
    });
  });
});
