import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateMessageDto {
  @IsUUID(4, { message: 'Invalid room ID format' })
  @IsNotEmpty({ message: 'Room ID is required' })
  roomId: string;

  @IsString({ message: 'Sender ID must be a string' })
  @IsNotEmpty({ message: 'Sender ID is required' })
  @IsUUID(4, { message: 'Invalid sender ID format' })
  senderId: string;

  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(2000, {
    message: 'Message is too long. Maximum 2000 characters allowed.',
  })
  content: string;

  @IsOptional()
  @IsString({ message: 'Media URL must be a string' })
  @IsUrl(
    {
      require_protocol: true,
      protocols: ['http', 'https'],
    },
    { message: 'Invalid media URL format' },
  )
  @MaxLength(500, { message: 'Media URL is too long' })
  mediaUrl?: string;
}
