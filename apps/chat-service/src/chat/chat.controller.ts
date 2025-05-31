import { Logger, Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('chat-rooms')
@ApiBearerAuth()
@Controller('chat-rooms')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get messages in a chat room' })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Access to chat room denied',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch messages',
  })
  async getRoomMessages(
    @Param('id') roomId: string,
    @Req() req: { user: { userId: string } },
  ) {
    try {
      return await this.chatService.getRoomMessages(roomId, req.user.userId);
    } catch (error) {
      this.logger.error(
        `Failed to get room messages: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to fetch messages');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all chat rooms for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Chat rooms retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Failed to fetch user chat rooms' })
  async getUserRooms(@Req() req: { user: { userId: string } }) {
    try {
      return await this.chatService.getUserRooms(req.user.userId);
    } catch (error) {
      this.logger.error(
        `Failed to get user rooms: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to fetch user chat rooms');
    }
  }
}
