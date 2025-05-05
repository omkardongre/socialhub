import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const fileUrl = await this.uploadService.uploadFile(file);
    const media = await this.uploadService.saveMetadata({
      url: fileUrl,
      type: file.mimetype,
      size: file.size,
      postId: body?.postId,
    });
    return {
      success: true,
      data: media,
      message: 'File uploaded and metadata saved successfully',
    };
  }
}
