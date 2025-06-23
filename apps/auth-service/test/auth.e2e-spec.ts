import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createTestUser, resetTestDB } from './utils';
import { AppModule } from '../src/app.module';
import { UserRestService } from '../src/external/user/user.rest.service';
import { NotificationRestService } from '../src/external/notification/notification.rest.service';
import { JwtService } from '@nestjs/jwt';

const prisma = new PrismaClient();

const mockUserRestService = {
  createUserProfile: jest.fn().mockResolvedValue({ success: true }),
};

const mockNotificationRestService = {
  createDefaultPreferences: jest.fn().mockResolvedValue({ success: true }),
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  // Mock instances
  let userRestService: jest.Mocked<UserRestService>;
  let notificationRestService: jest.Mocked<NotificationRestService>;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserRestService)
      .useValue(mockUserRestService)
      .overrideProvider(NotificationRestService)
      .useValue(mockNotificationRestService)
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get(JwtService);

    // Get the mock instances
    userRestService = moduleFixture.get(UserRestService);
    notificationRestService = moduleFixture.get(NotificationRestService);

    // Setup mock implementations
    userRestService.createUserProfile.mockResolvedValue({ success: true });
    notificationRestService.createDefaultPreferences.mockResolvedValue({
      success: true,
    });

    await app.init();
    await resetTestDB();
  }, 15000);

  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('/auth/signup (POST)', () => {
    it('should create new user (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(201);

      expect(res.body).toEqual({
        success: true,
        data: { userId: expect.any(String) },
        message: 'Signup successful. Please verify your email.',
      });
    });

    it('should reject duplicate email (409)', async () => {
      await createTestUser();

      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(409);

      expect(res.body).toEqual({
        statusCode: 409,
        error: 'Conflict',
        message: 'Email already in use',
      });
    });
  });

  describe('/auth/login (POST)', () => {
    let testUser;

    beforeEach(async () => {
      const isVerified = true;
      testUser = await createTestUser(isVerified);
    });

    it('should login successfully (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword',
        })
        .expect(201);

      expect(res.body).toEqual({
        success: true,
        message: 'Login successful',
      });

      // Check for access token cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieArr = Array.isArray(cookies) ? cookies : [cookies];
      expect(cookieArr.some((cookie) => cookie.includes('token='))).toBe(true);
    });

    it('should reject invalid password (403)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong-password',
        })
        .expect(403);

      expect(res.body).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Invalid credentials',
      });
    });
  });

  describe('/auth/health (GET)', () => {
    it('should return health status (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/health')
        .expect(200);

      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('/auth/verify (GET)', () => {
    it('should verify email with valid token', async () => {
      const isVerified = false;
      const user = await createTestUser(isVerified);
      const token = 'test-verification-token';

      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken: token },
      });

      const res = await request(app.getHttpServer())
        .get(`/auth/verify?token=${token}`)
        .expect(200);

      // The controller returns HTML, not JSON
      expect(res.text).toContain('Email Verified');
      expect(res.text).toContain('Go to Login');

      // Verify the external service was called
      expect(mockUserRestService.createUserProfile).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
      });
      expect(
        mockNotificationRestService.createDefaultPreferences,
      ).toHaveBeenCalledWith(user.id);
    });

    it('should reject invalid token (400)', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/verify?token=invalid-token')
        .expect(400);

      expect(res.text).toContain('Verification Failed');
    });
  });


});
