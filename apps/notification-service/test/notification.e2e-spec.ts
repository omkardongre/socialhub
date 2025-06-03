import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationType, EntityType } from '@prisma/client';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';

jest.setTimeout(30000);

// This assumes your AppModule imports NotificationsModule and sets up global pipes etc.
describe('NotificationsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let notificationQueue: Queue;

  // Clean up notifications and preferences for test users
  const cleanDatabase = async (prismaInstance: PrismaService | undefined | null) => {
    try {
      if (
        prismaInstance &&
        typeof prismaInstance.notification?.deleteMany === 'function' &&
        typeof prismaInstance.notificationPreference?.deleteMany === 'function'
      ) {
        await prismaInstance.notification.deleteMany({
          where: { receiverId: { contains: 'e2e-user-' } },
        });
        await prismaInstance.notificationPreference.deleteMany({
          where: { userId: { contains: 'e2e-user-' } },
        });
      }
    } catch (err) {
      console.error('Error during cleanDatabase:', err);
    }
  };

  beforeAll(async () => {
    // Initial cleanup to ensure a clean state
    const prismaTemp = new PrismaService();
    try {
      await prismaTemp.$connect();
      await cleanDatabase(prismaTemp);
    } catch (error) {
      console.error('Initial notification cleanup failed:', error);
    } finally {
      await prismaTemp.$disconnect();
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    notificationQueue = app.get(getQueueToken('notification-queue'));
  });

  afterAll(async () => {
    try {
      if (prisma) {
        await cleanDatabase(prisma);
      }
    } catch (error) {
      console.error('Notification cleanup failed:', error);
    } finally {
      if (notificationQueue) {
        // Force close all Redis connections (client, subscriber, etc.)
        await notificationQueue.close(true);
      }
      // Explicitly close all microservices if any are running
      if (typeof app.getMicroservices === 'function') {
        for (const ms of app.getMicroservices()) {
          if (typeof ms.close === 'function') {
            await ms.close();
          }
        }
      }
      if (app) {
        await app.close();
      }
      if (prisma) {
        await prisma.$disconnect();
      }
    }
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
      const res = await request(app.getHttpServer())
        .post('/notifications/preferences')
        .send({ userId })
        .expect(201);
      expect(res.body).toEqual({ success: true });
      // Clean up
      await prisma.notificationPreference.delete({ where: { userId } });
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
      // Clean up
      await prisma.notification.deleteMany({ where: { id: notification.id } });
      await prisma.notificationPreference.deleteMany({ where: { userId } });
    });
  });
});
