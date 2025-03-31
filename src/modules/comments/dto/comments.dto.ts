/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
// DTO để tạo bình luận mới
export class CreateCommentDto {
  @IsString()
  content: string;

  // rating là tùy chọn (ví dụ: từ 1 đến 5)
  @IsOptional()
  @Transform(({ value }) => Number(value)) // Chuyển đổi dữ liệu từ form-data (string) thành number
  @IsNumber()
  rating?: number;

  @Transform(({ value }) => Number(value)) // ép kiểu từ string → number
  @IsNumber()
  campaignId: number;

  @Transform(({ value }) => Number(value)) // ép kiểu từ string → number
  @IsNumber()
  userId: number;
}
