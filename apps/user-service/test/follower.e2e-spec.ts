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

  beforeAll(async () => {
    // Initial cleanup
    const prismaTemp = new PrismaService();
    try {
      await prismaTemp.$connect();
      await cleanDatabase(prismaTemp);
    } finally {
      await prismaTemp.$disconnect();
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          // Default: AuthN user is UserA
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

    // Create test users
    const userA = await prisma.user.create({
      data: { email: 'user-a@test-e2e-followers.com' },
    });
    userAId = userA.id;
    await prisma.profile.create({
      data: { userId: userAId, name: 'User A' },
    });
    const userB = await prisma.user.create({
      data: { email: 'user-b@test-e2e-followers.com' },
    });
    userBId = userB.id;
    await prisma.profile.create({
      data: { userId: userBId, name: 'User B' },
    });
  });

  afterAll(async () => {
    try {
      await cleanDatabase(prisma);
    } finally {
      if (app) await app.close();
    }
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('GET /followers/health', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/followers/health')
        .expect(200)
        .expect({
          success: true,
          data: 'ok',
          message: 'Followers module is healthy',
        });
    });
  });

  describe('POST /followers/follow/:id', () => {
    it('should follow user B as user A', async () => {
      await request(app.getHttpServer())
        .post(`/followers/follow/${userBId}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.followerId).toBe(userAId);
          expect(res.body.data.followedId).toBe(userBId);
          expect(res.body.message).toBe('Successfully followed user');
        });

      // Verify in DB
      const follow = await prisma.follower.findFirst({
        where: { followerId: userAId, followedId: userBId },
      });
      expect(follow).toBeDefined();
    });

    it('should not allow self-follow', async () => {
      await request(app.getHttpServer())
        .post(`/followers/follow/${userAId}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toMatch(/Can't follow yourself/);
        });
    });
  });

  describe('DELETE /followers/unfollow/:id', () => {
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
    });

    it('should unfollow user B as user A', async () => {
      // Create follower relationship for this test only
      await prisma.follower.create({
        data: { followerId: userAId, followedId: userBId },
      });
      await request(app.getHttpServer())
        .delete(`/followers/unfollow/${userBId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.count).toBe(1);
          expect(res.body.message).toBe('Successfully unfollowed user');
        });
      const follow = await prisma.follower.findFirst({
        where: { followerId: userAId, followedId: userBId },
      });
      expect(follow).toBeNull();
    });
    it('should return 404 if not following', async () => {
      // Ensure follower relationship does not exist
      await prisma.follower.deleteMany({
        where: { followerId: userAId, followedId: userBId },
      });
      await request(app.getHttpServer())
        .delete(`/followers/unfollow/${userBId}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.message).toBe('You are not following this user');
        });
    });
  });

  describe('GET /followers/followers', () => {
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
        .get('/followers/followers')
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
        .get('/followers/following')
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
