import {
  Logger,
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
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
    const messages = await this.chatService.getRoomMessages(
      roomId,
      req.user.userId,
    );
    return {
      success: true,
      data: messages,
      message: 'Messages retrieved successfully',
    };
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
    const rooms = await this.chatService.getUserRooms(req.user.userId);
    return {
      success: true,
      data: rooms,
      message: 'Chat rooms retrieved successfully',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new chat room' })
  @ApiResponse({ status: 201, description: 'Chat room created successfully' })
  @ApiResponse({ status: 400, description: 'Failed to create chat room' })
  async createRoom(@Req() req, @Body() body: { participants?: string[] }) {
    const authHeader =
      req.headers['authorization'] ||
      (req.cookies?.token ? `Bearer ${req.cookies.token}` : undefined);

    // Always include the creator in the participants
    const creatorId = req.user.userId;

    const participants =
      body.participants && body.participants.length > 0
        ? Array.from(new Set([creatorId, ...body.participants]))
        : [creatorId];

    const room = await this.chatService.createRoom(participants, authHeader);
    return {
      success: true,
      data: room,
      message: 'Chat room created successfully',
    };
  }
}
