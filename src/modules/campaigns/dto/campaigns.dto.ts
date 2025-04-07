/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars*/
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer'; //

// DTO để tạo một chiến dịch mới
export class CreateCampaignDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (
      typeof value === 'string' &&
      value.startsWith('[') &&
      value.endsWith(']')
    ) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  })
  tags?: string | string[];

  @IsNumber()
  @Type(() => Number)
  targetAmount: number;

  // Các trường khác tùy chọn
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString() // vì form-data truyền lên là string
  isFeatured?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (
      typeof value === 'string' &&
      value.startsWith('[') &&
      value.endsWith(']')
    ) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  })
  tags?: string | string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  targetAmount?: number;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
