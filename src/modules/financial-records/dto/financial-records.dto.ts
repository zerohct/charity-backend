/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNumber, IsString, IsOptional } from 'class-validator';

// DTO để tạo bản ghi tài chính mới
export class CreateFinancialRecordDto {
  @IsNumber()
  amount: number;

  @IsString()
  transactionType: string; // 'donation' hoặc 'expense'

  @IsOptional()
  @IsString()
  description?: string;

  // Thông tin liên kết đến campaign (và có thể donation)
  @IsNumber()
  campaignId: number;

  @IsOptional()
  @IsNumber()
  donationId?: number;
}
