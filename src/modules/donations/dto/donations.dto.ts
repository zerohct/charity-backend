/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer'; //

// DTO để tạo một giao dịch ủng hộ mới
export class CreateDonationDto {
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsNumber()
  @Type(() => Number)
  campaignId: number;

  @IsNumber()
  @Type(() => Number)
  donorId: number;
}
