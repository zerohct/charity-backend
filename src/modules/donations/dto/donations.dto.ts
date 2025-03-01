/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNumber, IsOptional, IsString } from 'class-validator';

// DTO để tạo một giao dịch ủng hộ mới
export class CreateDonationDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  // Bạn cần nhận biết campaignId và donorId từ phía client
  @IsNumber()
  campaignId: number;

  @IsNumber()
  donorId: number;
}
