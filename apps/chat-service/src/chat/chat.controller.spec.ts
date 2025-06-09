import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

// Mock ChatService
const mockChatService = {
  getRoomMessages: jest.fn(),
  getUserRooms: jest.fn(),
};

// Mock JwtAuthGuard
class MockJwtAuthGuard {
  canActivate(context: ExecutionContext) {
    return true;
  }
}

describe('ChatController', () => {
  let controller: ChatController;
  let service: typeof mockChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: mockChatService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get<ChatController>(ChatController);
    service = module.get(ChatService);
    jest.clearAllMocks();
  });

  describe('getRoomMessages', () => {
    it('should return messages for a room', async () => {
      const roomId = 'room1';
      const userId = 'user1';
      const messages = [{ id: 1, text: 'Hello' }];
      service.getRoomMessages.mockResolvedValue(messages);

      const result = await controller.getRoomMessages(roomId, { user: { userId } });
      expect(service.getRoomMessages).toHaveBeenCalledWith(roomId, userId);
      expect(result).toEqual({
        success: true,
        data: messages,
        message: 'Messages retrieved successfully',
      });
    });

    it('should log and throw error when service fails', async () => {
      const roomId = 'room2';
      const userId = 'user2';
      service.getRoomMessages.mockRejectedValue(new Error('DB error'));

      await expect(controller.getRoomMessages(roomId, { user: { userId } }))
        .rejects.toThrow(); // Now handled by global filter, will throw the original error
    });
  });

  describe('getUserRooms', () => {
    it('should return user chat rooms', async () => {
      const userId = 'user3';
      const rooms = [{ id: 'room1' }];
      service.getUserRooms.mockResolvedValue(rooms);

      const result = await controller.getUserRooms({ user: { userId } });
      expect(service.getUserRooms).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        success: true,
        data: rooms,
        message: 'Chat rooms retrieved successfully',
      });
    });

    it('should log and throw error when service fails', async () => {
      const userId = 'user4';
      service.getUserRooms.mockRejectedValue(new Error('DB error'));

      await expect(controller.getUserRooms({ user: { userId } }))
        .rejects.toThrow(); // Now handled by global filter, will throw the original error
    });
  });
});
