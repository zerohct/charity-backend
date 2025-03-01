/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/campaigns.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
  ) {}

  // Lấy danh sách các chiến dịch, bao gồm quan hệ media để hiển thị ảnh đại diện
  async findAll(): Promise<Campaign[]> {
    return this.campaignsRepository.find({ relations: ['media'] });
  }

  // Tạo một chiến dịch mới
  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const newCampaign = this.campaignsRepository.create(createCampaignDto);
    return this.campaignsRepository.save(newCampaign);
  }
}
