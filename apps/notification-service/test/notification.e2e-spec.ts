import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationType, EntityType } from '@prisma/client';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

jest.setTimeout(30000);

describe('NotificationsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let notificationQueue: DeepMockProxy<Queue>;

  const cleanDatabase = async (prismaInstance: PrismaService) => {
    await prismaInstance.notification.deleteMany({
      where: { receiverId: { startsWith: 'e2e-user-' } },
    });
    await prismaInstance.notificationPreference.deleteMany({
      where: { userId: { startsWith: 'e2e-user-' } },
    });
  };

  beforeAll(async () => {
    const tempPrisma = new PrismaService();
    try {
      await tempPrisma.$connect();
      await cleanDatabase(tempPrisma);
    } catch (e) {
      console.error('Failed to connect to DB for initial cleanup. Aborting tests.', e);
      throw e;
    } finally {
      await tempPrisma.$disconnect();
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getQueueToken('notification-queue'))
      .useValue(mockDeep<Queue>())
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    notificationQueue = app.get(getQueueToken('notification-queue'));
  });

  beforeEach(() => {
    if (notificationQueue) {
      notificationQueue.add.mockClear();
    }
  });

  afterEach(async () => {
    if (prisma) {
      await cleanDatabase(prisma);
    }
  });

  afterAll(async () => {
    await app?.close();
    await prisma?.$disconnect();
  });

  describe('/notifications/health (GET)', () => {
    it('should return healthy status', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications/health')
        .expect(200);
      expect(res.body).toEqual({
        success: true,
        data: 'ok',
        message: 'Notification service is healthy',
      });
    });
  });

  describe('/notifications/preferences (POST)', () => {
    it('should create default preferences', async () => {
      const userId = 'e2e-user-' + Date.now();
      await request(app.getHttpServer())
        .post('/notifications/preferences')
        .send({ userId })
        .expect(201)
        .then(res => {
          expect(res.body).toEqual({ success: true });
        });

      const preference = await prisma.notificationPreference.findUnique({
        where: { userId },
      });
      expect(preference).not.toBeNull();
      if (preference) {
        expect(preference.userId).toBe(userId);
      }
    });
  });


  describe('/notifications/:id/read (PUT)', () => {
    it('should mark notification as read', async () => {
      const userId = 'e2e-user-' + Date.now();
      await prisma.notificationPreference.create({
        data: { userId, followNotifications: true, postNotifications: true },
      });
      const notification = await prisma.notification.create({
        data: {
          receiverId: userId,
          senderId: 'e2e-sender',
          type: NotificationType.FOLLOW,
          entityId: 'entity1',
          entityType: EntityType.USER,
          content: 'test',
        },
      });
      const res = await request(app.getHttpServer())
        .put(`/notifications/${notification.id}/read`)
        .send({ isRead: true })
        .expect(200);
      expect(res.body.isRead).toBe(true);

      const updatedNotification = await prisma.notification.findUnique({
        where: { id: notification.id },
      });
      expect(updatedNotification).not.toBeNull();
      if (updatedNotification) {
        expect(updatedNotification.isRead).toBe(true);
      }
    });
  });

  describe('/notifications/test-queue (GET)', () => {
    it('should add a job to the notification queue', async () => {
      await request(app.getHttpServer())
        .get('/notifications/test-queue')
        .expect(200);

      expect(notificationQueue.add).toHaveBeenCalledTimes(1);
      expect(notificationQueue.add).toHaveBeenCalledWith(
        'send-notification',
        {
          userEmail: 'omkardongre5@gmail.com',
          type: 'USER_FOLLOWED',
          payload: expect.any(Object),
        },
      );
    });
  });
});
