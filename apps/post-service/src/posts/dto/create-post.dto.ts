import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  userId?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUrl()
  @IsOptional()
  @IsString()
  mediaUrl?: string;
}
