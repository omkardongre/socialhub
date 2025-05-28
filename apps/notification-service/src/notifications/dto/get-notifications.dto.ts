import {
  IsOptional,
  IsBoolean,
  IsArray,
  IsIn,
  IsInt,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { NotificationType, EntityType } from '@prisma/client';

export class GetNotificationsDto {
  @IsOptional()
  @Transform(({ value, obj }) => {
    const typesValue = value || obj.type;
    if (typesValue === undefined) return undefined;
    return Array.isArray(typesValue) ? typesValue : [typesValue];
  })
  @IsIn(Object.values(NotificationType), { each: true })
  @Type(() => String)
  types?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isRead?: boolean;

  @IsOptional()
  @Transform(({ value, obj }) => {
    const entityValue = value || obj.entityType;
    if (entityValue === undefined) return undefined;
    return Array.isArray(entityValue) ? entityValue : [entityValue];
  })
  @IsIn(Object.values(EntityType), { each: true })
  @Type(() => String)
  entityTypes?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number = 10;
}
