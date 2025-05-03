import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get('ping')
  ping() {
    return { message: 'User Service is live!' };
  }
}
