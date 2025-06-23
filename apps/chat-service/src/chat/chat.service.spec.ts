import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRestService } from '../external/user.rest.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

const mockUserRestService = {
  getUserProfile: jest.fn(),
};

const mockPrisma = {
  chatRoom: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  chatParticipant: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
    updateMany: jest.fn(),
    findMany: jest.fn(),
  },
  message: {
    create: jest.fn(),
    updateMany: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('ChatService', () => {
  let service: ChatService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UserRestService, useValue: mockUserRestService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();

    // Suppress logger output for tests
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  describe('createMessage', () => {
    const dto = { roomId: 'room1', senderId: 'user1', content: 'hi', mediaUrl: undefined };
    it('should create and return a message', async () => {
      prisma.chatRoom.findUnique.mockResolvedValue({ id: 'room1' });
      prisma.chatParticipant.findFirst.mockResolvedValue({});
      const message = { id: 123, ...dto };
      prisma.message.create.mockResolvedValue(message);
      const result = await service.createMessage(dto as any);
      expect(result).toEqual(message);
    });
    it('should throw NotFoundException if room not found', async () => {
      prisma.chatRoom.findUnique.mockResolvedValue(null);
      await expect(service.createMessage(dto as any)).rejects.toThrow(NotFoundException);
    });
    it('should throw ForbiddenException if not a participant', async () => {
      prisma.chatRoom.findUnique.mockResolvedValue({ id: 'room1' });
      prisma.chatParticipant.findFirst.mockResolvedValue(null);
      await expect(service.createMessage(dto as any)).rejects.toThrow(ForbiddenException);
    });
    it('should throw BadRequestException on other errors', async () => {
      prisma.chatRoom.findUnique.mockRejectedValue(new Error('DB fail'));
      await expect(service.createMessage(dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('joinRoom', () => {
    it('should upsert room and participant', async () => {
      prisma.chatRoom.upsert.mockResolvedValue({});
      prisma.chatParticipant.upsert.mockResolvedValue({ joined: true });
      const result = await service.joinRoom('room1', 'user1');
      expect(prisma.chatRoom.upsert).toHaveBeenCalled();
      expect(prisma.chatParticipant.upsert).toHaveBeenCalled();
      expect(result).toEqual({ joined: true });
    });
    it('should throw BadRequestException on error', async () => {
      prisma.chatRoom.upsert.mockRejectedValue(new Error('fail'));
      await expect(service.joinRoom('room1', 'user1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('leaveRoom', () => {
    it('should update participant lastSeen', async () => {
      prisma.chatParticipant.updateMany.mockResolvedValue({});
      await expect(service.leaveRoom('room1', 'user1')).resolves.not.toThrow();
    });
    it('should not throw error on failure', async () => {
      prisma.chatParticipant.updateMany.mockRejectedValue(new Error('fail'));
      await expect(service.leaveRoom('room1', 'user1')).resolves.not.toThrow();
    });
  });

  describe('getRoomParticipants', () => {
    it('should return participants', async () => {
      prisma.chatParticipant.findMany.mockResolvedValue([{ userId: 'user1' }]);
      const result = await service.getRoomParticipants('room1');
      expect(result).toEqual([{ userId: 'user1' }]);
    });
  });

  describe('markMessagesAsRead', () => {
    it('should update messages as read', async () => {
      prisma.message.updateMany.mockResolvedValue({ count: 2 });
      const result = await service.markMessagesAsRead('room1', 'user1');
      expect(result).toEqual({ count: 2 });
    });
  });

  describe('getRoomMessages', () => {
    it('should return messages if user has access', async () => {
      prisma.chatParticipant.findFirst.mockResolvedValue({});
      prisma.message.findMany.mockResolvedValue([{ id: 1 }]);
      const result = await service.getRoomMessages('room1', 'user1');
      expect(result).toEqual([{ id: 1 }]);
    });
    it('should throw ForbiddenException if user has no access', async () => {
      prisma.chatParticipant.findFirst.mockResolvedValue(null);
      await expect(service.getRoomMessages('room1', 'user1')).rejects.toThrow(ForbiddenException);
    });
    it('should throw BadRequestException on other errors', async () => {
      prisma.chatParticipant.findFirst.mockRejectedValue(new Error('fail'));
      await expect(service.getRoomMessages('room1', 'user1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserRooms', () => {
    it('should return user rooms', async () => {
      prisma.chatRoom.findMany.mockResolvedValue([{ id: 'room1' }]);
      const result = await service.getUserRooms('user1');
      expect(result).toEqual([{ id: 'room1' }]);
    });
    it('should throw BadRequestException on error', async () => {
      prisma.chatRoom.findMany.mockRejectedValue(new Error('fail'));
      await expect(service.getUserRooms('user1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('createRoom', () => {
    it('should create a room for a single participant and fetch their name', async () => {
      const participants = ['user1'];
      const authHeader = 'token';
      const mockUserProfile = { data: { name: 'John Doe' } };
      const mockRoom = {
        id: 'room1',
        name: 'John',
        participants: [{ userId: 'user1' }],
        messages: [],
      };

      mockUserRestService.getUserProfile.mockResolvedValue(mockUserProfile);
      prisma.chatRoom.create.mockResolvedValue(mockRoom);

      const result = await service.createRoom(participants, authHeader);

      expect(mockUserRestService.getUserProfile).toHaveBeenCalledWith(
        'user1',
        authHeader,
      );
      expect(prisma.chatRoom.create).toHaveBeenCalled();
      expect(result.name).toBe('John');
      expect(result).toEqual(mockRoom);
    });

    it('should create a room for multiple participants with a group name', async () => {
      const participants = ['user1', 'user2'];
      const authHeader = 'token';
      const mockRoom = {
        id: 'room2',
        name: 'Group Chat',
        participants: [{ userId: 'user1' }, { userId: 'user2' }],
        messages: [],
      };

      prisma.chatRoom.create.mockImplementation((args) => ({
        ...mockRoom,
        name: args.data.name,
      }));

      const result = await service.createRoom(participants, authHeader);

      expect(mockUserRestService.getUserProfile).not.toHaveBeenCalled();
      expect(prisma.chatRoom.create).toHaveBeenCalled();
      expect(result.name).toMatch(/Group Chat \d{4}/);
    });

    it('should throw BadRequestException on error', async () => {
      const participants = ['user1'];
      const authHeader = 'token';
      prisma.chatRoom.create.mockRejectedValue(new Error('DB error'));

      await expect(service.createRoom(participants, authHeader)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
