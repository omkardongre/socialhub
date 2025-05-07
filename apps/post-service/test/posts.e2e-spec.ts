import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { UserRestService } from '../src/external/user/user.rest.service';

// Test User IDs and emails
const testUserEmail = 'post-e2e-user@example.com';
const testUserId = 'clpostuser0000testuserid'; // Example fixed UUID
const anotherUserEmail = 'post-e2e-another@example.com';
const anotherUserId = 'clpostuser0001anotherid'; // Example fixed UUID for "followed" user

// Helper to clean DB state before/after tests
const cleanDatabase = async (prisma: PrismaService) => {
  await prisma.comment.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.post.deleteMany({});
  // Users are managed by a different service or assumed to exist for these tests.
  // prisma.user is not available as User model is not in post-service's schema.prisma.
};

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer;

  const mockUserRestService = {
    getFollowing: jest.fn(),
    getUserProfile: jest.fn(),
  };

  beforeAll(async () => {
    const tempPrisma = new PrismaService();
    await tempPrisma.$connect();
    try {
      await cleanDatabase(tempPrisma);
    } finally {
      await tempPrisma.$disconnect();
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { userId: testUserId };
          return true;
        },
      })
      .overrideProvider(UserRestService)
      .useValue(mockUserRestService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    httpServer = app.getHttpServer();

    // Users (testUserId, anotherUserId) are assumed to exist.
    // The JwtAuthGuard mock handles setting req.user for testUserId.
  }, 30000);

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  describe('GET /posts/ping', () => {
    it('should return service live message', async () => {
      const { body } = await request(httpServer).get('/posts/ping').expect(200);
      expect(body).toEqual({
        success: true,
        data: null,
        message: 'Post Service is live!',
      });
    });
  });

  describe('POST /posts', () => {
    afterEach(async () => {
      await prisma.post.deleteMany({});
    });

    it('should create a post successfully', async () => {
      const createPostDto = {
        userId: testUserId,
        content: 'My first E2E post!',
      };
      const { body } = await request(httpServer)
        .post('/posts')
        .send(createPostDto)
        .expect(201);

      expect(body.success).toBe(true);
      expect(body.data).toMatchObject(createPostDto);
      expect(body.data.id).toBeDefined();
      expect(body.message).toBe('Post created successfully');

      const dbPost = await prisma.post.findUnique({
        where: { id: body.data.id },
      });
      expect(dbPost).toMatchObject(createPostDto);
    });

    it('should fail with validation error for empty content', async () => {
      const createPostDto = { userId: testUserId, content: '' };
      const { body } = await request(httpServer)
        .post('/posts')
        .send(createPostDto)
        .expect(400);

      expect(body.message).toContain('content should not be empty');
    });

    it('should fail with validation error for missing userId', async () => {
      const createPostDto = { content: 'Post without user' };
      const { body } = await request(httpServer)
        .post('/posts')
        .send(createPostDto)
        .expect(400);
      expect(body.message).toContain('userId should not be empty');
    });
  });

  describe('GET /posts/user/:id', () => {
    let userPostId: string;
    beforeAll(async () => {
      const post = await prisma.post.create({
        data: { userId: testUserId, content: 'A post by test user' },
      });
      userPostId = post.id;
    });

    afterAll(async () => {
      await prisma.post.deleteMany({ where: { userId: testUserId } });
    });

    it('should get posts for a specific user', async () => {
      const { body } = await request(httpServer)
        .get(`/posts/user/${testUserId}`)
        .expect(200);

      expect(body.success).toBe(true);
      expect(body.message).toBe('User posts retrieved successfully');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data.some((p) => p.id === userPostId)).toBe(true);
    });

    it('should return empty array for a user with no posts', async () => {
      const noPostsUserId = 'nouserwithpostsid';
      const { body } = await request(httpServer)
        .get(`/posts/user/${noPostsUserId}`)
        .expect(200);

      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });
  });

  describe('Interactions on a shared post (comments, likes)', () => {
    let sharedPostId: string;

    beforeAll(async () => {
      const post = await prisma.post.create({
        data: { userId: testUserId, content: 'Shared post for interactions' },
      });
      sharedPostId = post.id;
    });

    afterAll(async () => {
      // Delete dependent records first
      await prisma.comment.deleteMany({ where: { postId: sharedPostId } });
      await prisma.like.deleteMany({ where: { postId: sharedPostId } });
      // Then delete the post
      await prisma.post.deleteMany({ where: { id: sharedPostId } });
    });

    describe('POST /posts/:id/comments', () => {
      afterEach(async () => {
        await prisma.comment.deleteMany({ where: { postId: sharedPostId } });
      });

      it('should add a comment to a post', async () => {
        const commentDto = {
          userId: anotherUserId,
          content: 'Great shared post!',
        };
        const { body } = await request(httpServer)
          .post(`/posts/${sharedPostId}/comments`)
          .send(commentDto)
          .expect(201);

        expect(body.success).toBe(true);
        expect(body.data).toMatchObject({
          ...commentDto,
          postId: sharedPostId,
        });
        expect(body.data.id).toBeDefined();
        expect(body.message).toBe('Comment added successfully');

        const dbComment = await prisma.comment.findUnique({
          where: { id: body.data.id },
        });
        expect(dbComment).toMatchObject({
          ...commentDto,
          postId: sharedPostId,
        });
      });

      it('should fail to comment on a non-existent post returning 500 due to Prisma error', async () => {
        const commentDto = {
          userId: anotherUserId,
          content: 'Will this work?',
        };
        // Prisma will throw P2003 (Foreign key constraint failed) or P2025 (Record to update not found)
        // if the postId does not exist. The default exception filter turns these into 500 errors.
        // For a 404, the service would need to explicitly check if the post exists first.
        await request(httpServer)
          .post(`/posts/nonexistentpostid/comments`)
          .send(commentDto)
          .expect(500);
      });
    });

    describe('POST /posts/:id/like', () => {
      afterEach(async () => {
        await prisma.like.deleteMany({ where: { postId: sharedPostId } });
      });

      it('should like a post', async () => {
        const likeDto = { userId: anotherUserId };
        const { body } = await request(httpServer)
          .post(`/posts/${sharedPostId}/like`)
          .send(likeDto)
          .expect(201);

        expect(body.success).toBe(true);
        expect(body.message).toBe('Post liked successfully');
        expect(body.data.userId).toBe(anotherUserId);
        expect(body.data.postId).toBe(sharedPostId);

        const dbLike = await prisma.like.findUnique({
          where: {
            postId_userId: { postId: sharedPostId, userId: anotherUserId },
          },
        });
        expect(dbLike).toBeDefined();
      });

      it('should return 409 conflict when liking an already liked post', async () => {
        const likeDto = { userId: anotherUserId };
        await request(httpServer)
          .post(`/posts/${sharedPostId}/like`)
          .send(likeDto)
          .expect(201);
        const { body } = await request(httpServer)
          .post(`/posts/${sharedPostId}/like`)
          .send(likeDto)
          .expect(409);

        expect(body.message).toBe('User already liked this post');
      });
    });

    describe('GET /posts/:id/interactions', () => {
      beforeAll(async () => {
        await prisma.comment.create({
          data: {
            postId: sharedPostId,
            userId: anotherUserId,
            content: 'Interaction comment',
          },
        });
        await prisma.like.create({
          data: { postId: sharedPostId, userId: anotherUserId },
        });
      });

      it('should get post interactions (comments and likes count)', async () => {
        const { body } = await request(httpServer)
          .get(`/posts/${sharedPostId}/interactions`)
          .expect(200);

        expect(body.success).toBe(true);
        expect(body.message).toBe('Post interactions retrieved successfully');
        expect(body.data.comments).toBeInstanceOf(Array);
        expect(body.data.comments.length).toBeGreaterThanOrEqual(1);
        expect(body.data.likesCount).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('GET /posts/feed', () => {
    let feedPostId: string;
    beforeEach(async () => {
      mockUserRestService.getFollowing.mockResolvedValue([
        { id: anotherUserId },
      ]);
      const post = await prisma.post.create({
        data: {
          userId: anotherUserId,
          content: 'A post from a followed user for the feed',
        },
      });
      feedPostId = post.id;
    });

    afterEach(async () => {
      await prisma.post.deleteMany({ where: { id: feedPostId } });
    });

    it('should retrieve feed for the authenticated user (testUserId)', async () => {
      const { body } = await request(httpServer)
        .get('/posts/feed')
        .query({ limit: 5, offset: 0 })
        .expect(200);

      expect(body.success).toBe(true);
      expect(body.message).toBe('Feed retrieved successfully');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].id).toBe(feedPostId);
      expect(body.data[0].userId).toBe(anotherUserId);
      expect(mockUserRestService.getFollowing).toHaveBeenCalledWith(testUserId);
    });

    it('should return an empty feed if the user follows no one with posts', async () => {
      mockUserRestService.getFollowing.mockResolvedValue([]);
      // Ensure no posts from anotherUserId exist from previous beforeEach if it wasn't cleaned or specific to this test
      await prisma.post.deleteMany({ where: { userId: anotherUserId } });

      const { body } = await request(httpServer)
        .get('/posts/feed')
        .query({ limit: 5, offset: 0 })
        .expect(200);

      expect(body.data).toEqual([]);
    });
  });
});
