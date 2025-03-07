/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/campaigns.dto';
import { UpdateCampaignDto } from './dto/campaigns.dto';  


@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // GET /campaigns: Lấy danh sách các chiến dịch
  @Get()
  async getAllCampaigns() {
    return this.campaignsService.findAll();
  }
  @Get(':id')
  async getCampaignById(@Param('id') id: number) {
    return this.campaignsService.findById(id);
  }

  // POST /campaigns: Tạo một chiến dịch mới
  @Post()
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }
  @Put(':id')
  async updateCampaign(
    @Param('id') id: number,
    @Body() updateCampaignDto: UpdateCampaignDto
  ) {
    return this.campaignsService.update(id, updateCampaignDto);
  }
  @Delete(':id')
  async deleteCampaign(@Param('id') id: number) {
    return this.campaignsService.delete(id);
  }

  @Get('search')
  async searchCampaigns(@Query('query') query: string) {
    return this.campaignsService.search(query);
  }
  
}
