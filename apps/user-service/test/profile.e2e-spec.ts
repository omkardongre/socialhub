import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';

describe('ProfilesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userAId: string;
  let userBId: string;
  let profileAId: string;

  // Function to clean DB - called beforeAll and afterAll
  const cleanDatabase = async (prismaInstance: PrismaService) => {
    // Delete profiles before users
    await prismaInstance.profile.deleteMany({
      where: { user: { email: { contains: '@test-e2e-profile.com' } } },
      });


    await prismaInstance.user.deleteMany({
      where: { email: { contains: '@test-e2e-profile.com' } },
    });
  };

  beforeAll(async () => {
    // Connect temporary Prisma client for initial cleanup
    const prismaTemp = new PrismaService();
    try {
      await prismaTemp.$connect();
      await cleanDatabase(prismaTemp);
    } catch (error) {
      console.error('Initial profile cleanup failed:', error);
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
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test users and profiles
    try {
      const userA = await prisma.user.create({
        data: { email: 'user-a@test-e2e-profile.com' },
      });
      userAId = userA.id; // Assign userAId here for the guard mock
      const profileA = await prisma.profile.create({
        data: { userId: userAId, name: 'User A', bio: 'Initial Bio A' },
      });
      profileAId = profileA.id;

      const userB = await prisma.user.create({
        data: { email: 'user-b@test-e2e-profile.com' },
      });
      userBId = userB.id;
      await prisma.profile.create({
        data: { userId: userBId, name: 'User B', bio: 'Initial Bio B' },
      });
    } catch (error) {
      console.error('Test profile data creation failed:', error);
      await cleanDatabase(prisma); // Attempt cleanup even if setup fails
      await app.close();
      throw error; // Fail the test suite
    }
  });

  afterAll(async () => {
    try {
      await cleanDatabase(prisma); // Clean up test data
    } catch (error) {
      console.error('Profile cleanup failed:', error);
    } finally {
      if (app) {
        await app.close();
      }
    }
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('GET /profile/health', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/profile/health')
        .expect(200)
        .expect({
          success: true,
          data: 'ok',
          message: 'Profile service is healthy',
        });
    });
  });

  describe('GET /profile/:id', () => {
    it('should get profile for User A by ID', () => {
      return request(app.getHttpServer())
        .get(`/profile/${userAId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.userId).toBe(userAId);
          expect(res.body.data.name).toBe('User A');
          expect(res.body.data.bio).toBe('Initial Bio A');
        });
    });

    it('should get profile for User B by ID', () => {
      return request(app.getHttpServer())
        .get(`/profile/${userBId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.userId).toBe(userBId);
          expect(res.body.data.name).toBe('User B');
          expect(res.body.data.bio).toBe('Initial Bio B');
        });
    });

    it('should return 404 for non-existent profile ID', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'; // Example UUID
      return request(app.getHttpServer())
        .get(`/profile/${nonExistentId}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Profile not found');
        });
    });
  });

  describe('PUT /profile', () => {
    it("should update the authenticated user's (User A) profile", async () => {
      const updatePayload = {
        bio: 'Updated Bio A',
        avatarUrl: 'http://example.com/new-avatar.jpg',
      };

      await request(app.getHttpServer())
        .put('/profile')
        .send(updatePayload)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(profileAId);
          expect(res.body.data.userId).toBe(userAId);
          expect(res.body.data.bio).toBe(updatePayload.bio);
          expect(res.body.data.avatarUrl).toBe(updatePayload.avatarUrl);
          expect(res.body.message).toBe('Profile updated successfully');
        });

      // Verify in DB
      const updatedProfileDb = await prisma.profile.findUnique({
        where: { userId: userAId },
      });
      expect(updatedProfileDb).toBeDefined();
      expect(updatedProfileDb?.bio).toBe(updatePayload.bio);
      expect(updatedProfileDb?.avatarUrl).toBe(updatePayload.avatarUrl);
    });

    it('should only update provided fields (e.g., only bio)', async () => {
      const updatePayload = {
        bio: 'Only Bio Updated A',
      };
      const previousAvatar = 'http://example.com/new-avatar.jpg'; // From previous test

      await request(app.getHttpServer())
        .put('/profile')
        .send(updatePayload)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.bio).toBe(updatePayload.bio);
          expect(res.body.data.avatarUrl).toBe(previousAvatar); // Avatar should remain unchanged
        });

      // Verify in DB
      const updatedProfileDb = await prisma.profile.findUnique({
        where: { userId: userAId },
      });
      expect(updatedProfileDb?.bio).toBe(updatePayload.bio);
      expect(updatedProfileDb?.avatarUrl).toBe(previousAvatar);
    });

    // Add more tests for PUT if needed (e.g., empty payload, invalid data if DTOs were used)
  });

  describe('POST /profile', () => {
    it('should create a new user profile', async () => {
      // Generate a new UUID for userId
      const newUserId = uuidv4();
      const newUserEmail = `newuser-${Date.now()}@test-e2e-profile.com`;
      const payload = {
        userId: newUserId,
        email: newUserEmail,
      };

      const res = await request(app.getHttpServer())
        .post('/profile')
        .send(payload)
        .expect(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBe(newUserId);
      expect(res.body.data.name).toBe(newUserEmail.split('@')[0]);
      expect(res.body.message).toBe('Profile created successfully');

      // Confirm in DB
      const profileDb = await prisma.profile.findUnique({ where: { userId: newUserId } });
      expect(profileDb).toBeDefined();
      expect(profileDb?.userId).toBe(newUserId);
    });

    it('should not allow duplicate profile creation', async () => {
      // Use UserA's ID and email
      const payload = {
        userId: userAId,
        email: 'user-a@test-e2e-profile.com',
      };
      const res = await request(app.getHttpServer())
        .post('/profile')
        .send(payload)
        .expect(409); // Conflict
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should return 400 for invalid payload', async () => {
      const payload = {
        userId: 'not-a-uuid', // Invalid UUID
        email: 'not-an-email', // Invalid email
      };
      const res = await request(app.getHttpServer())
        .post('/profile')
        .send(payload)
        .expect(400);
      expect(res.body.message).toBeDefined();
    });
  });
});
