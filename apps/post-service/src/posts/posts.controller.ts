import { Controller, Get } from '@nestjs/common';

@Controller('posts')
export class PostsController {
  @Get('ping')
  ping() {
    return { message: 'Post Service is live!' };
  }
}
