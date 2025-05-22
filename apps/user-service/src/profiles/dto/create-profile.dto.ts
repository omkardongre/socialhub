import { IsEmail, IsUUID } from 'class-validator';

export class CreateProfileDto {
  @IsUUID()
  userId: string;

  @IsEmail()
  email: string;
}
