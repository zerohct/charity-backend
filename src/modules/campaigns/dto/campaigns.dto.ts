/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

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

  // Tags dưới dạng mảng chuỗi (sẽ được lưu dưới dạng JSON)
  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsNumber()
  targetAmount: number;

  // Các trường khác tùy chọn
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  // Thêm các trường startDate, deadline, location,... nếu cần
}
