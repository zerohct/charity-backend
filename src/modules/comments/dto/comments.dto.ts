/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsOptional, IsNumber } from 'class-validator';

// DTO để tạo bình luận mới
export class CreateCommentDto {
  @IsString()
  content: string;

  // rating là tùy chọn (ví dụ: từ 1 đến 5)
  @IsOptional()
  @IsNumber()
  rating?: number;

  // Thông tin liên kết đến chiến dịch và người dùng
  @IsNumber()
  campaignId: number;

  @IsNumber()
  userId: number;
}
