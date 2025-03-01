/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/campaigns.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // GET /campaigns: Lấy danh sách các chiến dịch
  @Get()
  async getAllCampaigns() {
    return this.campaignsService.findAll();
  }

  // POST /campaigns: Tạo một chiến dịch mới
  @Post()
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }
}
