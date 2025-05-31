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
        data: {
          access_token: expect.any(String),
          refresh_token: expect.any(String),
        },
        message: 'Login successful',
      });
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

      // Verify the response
      expect(res.body).toEqual({
        success: true,
        message: 'Email verified and profile initialized successfully',
      });

      // Verify the external service was called
      expect(mockUserRestService.createUserProfile).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
      });
      expect(
        mockNotificationRestService.createDefaultPreferences,
      ).toHaveBeenCalledWith(user.id);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let testUser;
    let refreshToken: string;

    beforeEach(async () => {
      // Create a test user and login to get a refresh token
      testUser = await createTestUser(true);
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword',
        })
        .expect(201);

      refreshToken = loginRes.body.data.refresh_token;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(201);

      expect(res.body).toEqual({
        success: true,
        data: {
          access_token: expect.any(String),
          user: {
            id: testUser.id,
            email: 'test@example.com',
          },
        },
        message: 'Tokens refreshed successfully',
      });
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: 'invalid-token' })
        .expect(403);

      expect(res.body).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Invalid refresh token',
      });
    });

    it('should reject expired refresh token', async () => {
      // Create an expired refresh token
      const expiredToken = await jwtService.signAsync(
        { sub: testUser.id, email: 'test@example.com' },
        { expiresIn: '-1s' },
      );

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: expiredToken })
        .expect(403);

      expect(res.body).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Invalid refresh token',
      });
    });

    it('should reject if no refresh token provided', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);

      expect(res.body).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Refresh token is required',
      });
    });
  });
});
