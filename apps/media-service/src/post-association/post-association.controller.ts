import { Body, Controller, Patch } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('media')
export class PostAssociationController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('associate')
  async associatePostToMedia(@Body() dto: { mediaId: string; postId: string }) {
    const updated = await this.prisma.media.update({
      where: { id: dto.mediaId },
      data: { postId: dto.postId },
    });
    return {
      success: true,
      data: updated,
      message: 'Media associated with post successfully',
    };
  }
}
