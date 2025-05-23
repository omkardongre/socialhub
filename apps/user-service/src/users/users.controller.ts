import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Get('ping')
  @ApiOperation({ summary: 'Ping the user service' })
  @ApiResponse({
    status: 200,
    description: 'User Service is live!',
    schema: {
      example: {
        success: true,
        data: null,
        message: 'User Service is live!',
      },
    },
  })
  ping() {
    return {
      success: true,
      data: null,
      message: 'User Service is live!',
    };
  }
}
