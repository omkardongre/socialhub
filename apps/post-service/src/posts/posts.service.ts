import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikePostDto } from './dto/like-post.dto';
import { UserRestService } from 'src/external/user/user.rest.service';
import { MediaRestService } from 'src/external/media/media.rest.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private userRestService: UserRestService,
    private mediaRestService: MediaRestService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        userId: createPostDto.userId,
        content: createPostDto.content,
        mediaUrl: undefined,
      },
    });

    return post;
  }
}