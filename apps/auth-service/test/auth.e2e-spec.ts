import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createTestUser, resetTestDB } from './utils';
import { AppModule } from '../src/app.module';

const prisma = new PrismaClient();

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
    beforeEach(async () => {
      await createTestUser();
    });

    it('should login successfully (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword', // Raw password from createTestUser
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
});
