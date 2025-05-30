import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
