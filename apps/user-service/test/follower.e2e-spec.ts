import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';

describe('FollowersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userAId: string;
  let userBId: string;

  // Clean up followers and users before/after tests
  const cleanDatabase = async (prismaInstance: PrismaService) => {
    await prismaInstance.follower.deleteMany({});
    await prismaInstance.profile.deleteMany({});
    await prismaInstance.user.deleteMany({});
  };

  let userAEmail: string;
  let userBEmail: string;

  beforeAll(async () => {
    // Initial cleanup
    const prismaTemp = new PrismaService();
    try {
      await prismaTemp.$connect();
      await cleanDatabase(prismaTemp);
    } finally {
      await prismaTemp.$disconnect();
    }

    // Use unique emails for each test run
    const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);
    userAEmail = `user-a-${unique}@test-e2e-followers.com`;
    userBEmail = `user-b-${unique}@test-e2e-followers.com`;

    // Create a temporary app to get a working PrismaService instance
    const tempModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const tempApp = tempModule.createNestApplication();
    await tempApp.init();
    prisma = tempApp.get<PrismaService>(PrismaService);

    // Create test users and profiles before setting up the guard
    const userA = await prisma.user.create({
      data: { email: userAEmail },
    });
    userAId = userA.id;
    await prisma.profile.create({
      data: { userId: userAId, name: 'User A' },
    });
    const userB = await prisma.user.create({
      data: { email: userBEmail },
    });
    userBId = userB.id;
    await prisma.profile.create({
      data: { userId: userBId, name: 'User B' },
    });
    await tempApp.close();

    // Now create the real app with the guard override
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { sub: userAId };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    if (prisma) {
      await cleanDatabase(prisma);
    }
    if (app) {
      await app.close();
    }
  });

  describe('GET /users/:id/followers', () => {
    beforeEach(async () => {
      // Clean up all follower records for both users
      await prisma.follower.deleteMany({
        where: {
          OR: [
            { followerId: userAId, followedId: userBId },
            { followerId: userBId, followedId: userAId },
          ],
        },
      });
      await prisma.profile.deleteMany({
        where: { userId: { in: [userAId, userBId] } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [userAId, userBId] } },
      });
      // Re-create users and profiles
      await prisma.user.create({
        data: { id: userAId, email: 'usera@example.com' },
      });
      await prisma.user.create({
        data: { id: userBId, email: 'userb@example.com' },
      });
      await prisma.profile.create({
        data: { userId: userAId, name: 'User A' },
      });
      await prisma.profile.create({
        data: { userId: userBId, name: 'User B' },
      });
      // Now create follower record for userB follows userA
      await prisma.follower.create({
        data: { followerId: userBId, followedId: userAId },
      });
    });

    it('should return followers for user A', async () => {
      await request(app.getHttpServer())
        .get(`/users/${userAId}/followers`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data[0]?.followerId).toBe(userBId);
          expect(res.body.message).toBe(
            'Followers list retrieved successfully',
          );
        });
    });
  });

  describe('GET /followers/following', () => {
    beforeEach(async () => {
      // Clean up all follower records for both users
      await prisma.follower.deleteMany({
        where: {
          OR: [
            { followerId: userAId, followedId: userBId },
            { followerId: userBId, followedId: userAId },
          ],
        },
      });
      await prisma.profile.deleteMany({
        where: { userId: { in: [userAId, userBId] } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [userAId, userBId] } },
      });
      // Re-create users and profiles
      await prisma.user.create({
        data: { id: userAId, email: 'usera@example.com' },
      });
      await prisma.user.create({
        data: { id: userBId, email: 'userb@example.com' },
      });
      await prisma.profile.create({
        data: { userId: userAId, name: 'User A' },
      });
      await prisma.profile.create({
        data: { userId: userBId, name: 'User B' },
      });
      // Now create follower record for userA follows userB
      await prisma.follower.create({
        data: { followerId: userAId, followedId: userBId },
      });
    });

    it('should return following for user A', async () => {
      await request(app.getHttpServer())
        .get(`/users/${userAId}/following`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data[0]?.followedId).toBe(userBId);
          expect(res.body.message).toBe(
            'Following list retrieved successfully',
          );
        });
    });
  });
});
