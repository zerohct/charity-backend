/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/donations.dto';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  // GET /donations: Lấy danh sách giao dịch ủng hộ
  @Get()
  async getAllDonations() {
    return this.donationsService.findAll();
  }

  // POST /donations: Tạo giao dịch ủng hộ mới
  @Post()
  async createDonation(@Body() createDonationDto: CreateDonationDto) {
    return this.donationsService.create(createDonationDto);
  }
}
