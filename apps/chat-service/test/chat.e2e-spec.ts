import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ChatModule } from '../src/chat/chat.module';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserRestService } from '../src/external/user.rest.service';

// A mock user ID for our tests
const mockUserId = 'e2e-test-user';

// A mock guard that bypasses JWT validation and injects a mock user
class MockAuthGuard {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.user = { userId: mockUserId };
    return true;
  }
}

const mockUserRestService = {
  getUserProfile: jest.fn().mockResolvedValue({ data: { name: 'Test User' } }),
};

describe('ChatController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let roomId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ChatModule],
    })
      .overrideProvider(UserRestService)
      .useValue(mockUserRestService)
      .overrideGuard(JwtAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up database before tests
    await prisma.message.deleteMany({});
    await prisma.chatParticipant.deleteMany({});
    await prisma.chatRoom.deleteMany({});
  });

  afterAll(async () => {
    // Clean up database after tests
    await prisma.message.deleteMany({});
    await prisma.chatParticipant.deleteMany({});
    await prisma.chatRoom.deleteMany({});
    await app.close();
  });

  it('POST /chat-rooms - should create a new chat room', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat-rooms')
      .send({ participants: ['participant-2'] })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.participants).toHaveLength(2);
    expect(
      response.body.data.participants.some((p) => p.userId === mockUserId),
    ).toBe(true);
    roomId = response.body.data.id; // Save for next tests
  });

  it('GET /chat-rooms - should retrieve chat rooms for the user', async () => {
    const response = await request(app.getHttpServer())
      .get('/chat-rooms')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].id).toBe(roomId);
  });

  it('GET /chat-rooms/:id/messages - should retrieve messages for a room', async () => {
    // First, create a message directly via prisma to test retrieval
    await prisma.message.create({
      data: {
        roomId: roomId,
        senderId: mockUserId,
        content: 'Hello E2E!',
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/chat-rooms/${roomId}/messages`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].content).toBe('Hello E2E!');
  });

  it('GET /chat-rooms/:id/messages - should return 403 if user is not a participant', async () => {
    // Create a room the user is not part of
    const otherRoom = await prisma.chatRoom.create({
      data: {
        name: 'Secret Room',
        participants: {
          create: [{ userId: 'another-user-1' }, { userId: 'another-user-2' }],
        },
      },
    });

    await request(app.getHttpServer())
      .get(`/chat-rooms/${otherRoom.id}/messages`)
      .expect(403);
  });
});