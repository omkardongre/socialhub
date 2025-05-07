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
  let userCId: string;

  // Function to clean DB - called beforeAll and afterAll
  const cleanDatabase = async (prismaInstance: PrismaService) => {
    await prismaInstance.follower.deleteMany({});
    // Delete profiles before users if there's a dependency
    await prismaInstance.profile.deleteMany({
      where: { user: { email: { contains: '@test-e2e-follow.com' } } },
    });
    await prismaInstance.user.deleteMany({
      where: { email: { contains: '@test-e2e-follow.com' } },
    });
  };

  beforeAll(async () => {
    // Connect temporary Prisma client for initial cleanup
    const prismaTemp = new PrismaService();
    try {
      await prismaTemp.$connect();
      await cleanDatabase(prismaTemp);
    } catch (error) {
      console.error('Initial cleanup failed:', error);
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
          // Use userAId once it's created below. AuthN user is UserA.
          req.user = { userId: userAId };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Ensure DTOs are validated
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test users and profiles
    try {
      const userA = await prisma.user.create({
        data: {
          email: 'follow-a@test-e2e-follow.com',
        },
      });
      userAId = userA.id; // Assign userAId here
      await prisma.profile.create({
        data: { userId: userAId, bio: 'User A E2E Bio' },
      });

      const userB = await prisma.user.create({
        data: {
          email: 'follow-b@test-e2e-follow.com',
        },
      });
      userBId = userB.id;
      await prisma.profile.create({
        data: { userId: userBId, bio: 'User B E2E Bio' },
      });

      const userC = await prisma.user.create({
        data: {
          email: 'follow-c@test-e2e-follow.com',
        },
      });
      userCId = userC.id;
      await prisma.profile.create({
        data: { userId: userCId, bio: 'User C E2E Bio' },
      });
    } catch (error) {
      console.error('Test data creation failed:', error);
      // Ensure cleanup happens even if setup fails
      await cleanDatabase(prisma);
      await app.close();
      throw error; // Rethrow to fail the test suite
    }
  });

  afterAll(async () => {
    try {
      await cleanDatabase(prisma); // Clean up test data
    } catch (error) {
      console.error('Cleanup failed:', error);
    } finally {
      await app.close();
    }
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('Follow/Unfollow Flow', () => {
    it('(GET /followers/following) initially returns empty list for User A', () => {
      return request(app.getHttpServer())
        .get('/followers/following')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toEqual([]);
        });
    });

    it('(POST /followers/follow/:id) User A follows User B successfully', async () => {
      await request(app.getHttpServer())
        .post(`/followers/follow/${userBId}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.followerId).toBe(userAId);
          expect(res.body.data.followingId).toBe(userBId);
        });

      // Verify in DB
      const follow = await prisma.follower.findUnique({
        where: {
          followerId_followingId: { followerId: userAId, followingId: userBId },
        },
      });
      expect(follow).toBeDefined();
    });

    it('(POST /followers/follow/:id) User A cannot follow self', () => {
      return request(app.getHttpServer())
        .post(`/followers/follow/${userAId}`) // Trying to follow self
        .expect(400) // Expecting BadRequestException
        .expect((res) => {
          expect(res.body.message).toContain("Can't follow yourself");
        });
    });

    it("(GET /followers/following) returns User B in User A's following list", () => {
      return request(app.getHttpServer())
        .get('/followers/following')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].followingId).toBe(userBId);
          // Check if profile details are included (based on service include)
          expect(res.body.data[0].following.id).toBe(userBId);
        });
    });

    // Test GET /followers/followers for User A
    it('(GET /followers/followers) initially returns empty list for User A', () => {
      return request(app.getHttpServer())
        .get('/followers/followers')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toEqual([]);
        });
    });

    it('(GET /followers/followers) returns User C after User C follows User A', async () => {
      // Simulate User C following User A (direct DB action for simplicity)
      await prisma.follower.create({
        data: { followerId: userCId, followingId: userAId },
      });

      await request(app.getHttpServer())
        .get('/followers/followers')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].followerId).toBe(userCId);
          // Check if profile details are included (based on service include)
          expect(res.body.data[0].follower.id).toBe(userCId);
        });
    });

    it('(DELETE /followers/unfollow/:id) User A unfollows User B successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/followers/unfollow/${userBId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.count).toBe(1); // Prisma deleteMany returns count
        });

      // Verify in DB
      const follow = await prisma.follower.findUnique({
        where: {
          followerId_followingId: { followerId: userAId, followingId: userBId },
        },
      });
      expect(follow).toBeNull();
    });

    it('(GET /followers/following) returns empty list for User A after unfollow', () => {
      return request(app.getHttpServer())
        .get('/followers/following')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toEqual([]);
        });
    });

    it('(DELETE /followers/unfollow/:id) User A unfollowing User C (not followed) returns count 0', () => {
      return request(app.getHttpServer())
        .delete(`/followers/unfollow/${userCId}`) // User A never followed User C
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.count).toBe(0);
        });
    });
  });
});
