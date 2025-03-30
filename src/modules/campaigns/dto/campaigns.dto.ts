/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer'; // 

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

  // Tags dưới dạng mảng chuỗi (sẽ được lưu dưới dạng JSON)
  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Validate từng phần tử
  tags?: string[];

  @IsNumber()
  @Type(() => Number)//CẦN CÓ ĐỂ ÉP KIỂU
  targetAmount: number;

  // Các trường khác tùy chọn
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean) //CẦN CÓ ĐỂ ÉP KIỂU "true" thành true
  isFeatured?: boolean;

  // Thêm các trường startDate, deadline, location,... nếu cần
  // Thêm startDate và deadline dưới dạng chuỗi ISO date
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
  @IsNumber()
  targetAmount?: number;
}

