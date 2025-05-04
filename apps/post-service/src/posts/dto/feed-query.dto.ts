import { IsOptional, IsNumberString } from 'class-validator';

export class FeedQueryDto {
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  offset?: string;
}
