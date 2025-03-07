/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/campaigns.dto';
import { UpdateCampaignDto } from './dto/campaigns.dto';  
import { NotFoundException } from '@nestjs/common';
import { CampaignMedia } from './entities/campaign-media.entity';
import { ILike } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Express } from 'express';



@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,

    @InjectRepository(CampaignMedia)
    private campaignMediaRepository: Repository<CampaignMedia>,
  ) {}

  // Lấy danh sách các chiến dịch, bao gồm quan hệ media để hiển thị ảnh đại diện
  async findAll(): Promise<Campaign[]> {
    return this.campaignsRepository.find({ relations: ['media'] });
  }

  // Tạo một chiến dịch mới
  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    if (!createCampaignDto.title) {
      throw new BadRequestException('Title is required');
    }
  
    const newCampaign = this.campaignsRepository.create(createCampaignDto);
    return this.campaignsRepository.save(newCampaign);
  }

    //Tìm chiến dịch theo ID
    async findById(id: number): Promise<Campaign> {
      const campaign = await this.campaignsRepository.findOne({ where: { id }, relations: ['media'] });
    
      if (!campaign) {
        throw new NotFoundException(`Campaign with ID ${id} not found`);
      }
    
      return campaign;
    }
    
  
    // Cập nhật chiến dịch
    async update(id: number, updateCampaignDto: UpdateCampaignDto): Promise<Campaign> {
      await this.campaignsRepository.update(id, updateCampaignDto);
      return this.findById(id); // Trả về chiến dịch sau khi cập nhật
    }
  
    // Xóa chiến dịch
    async delete(id: number): Promise<void> {
      await this.campaignsRepository.delete(id);
    }
  
    // Tìm kiếm chiến dịch theo tiêu đề
    async search(query: string): Promise<Campaign[]> {
      return this.campaignsRepository.find({
        where: { title: ILike(`%${query}%`) }, // Tìm theo tiêu đề, không phân biệt hoa thường
      });
    }
////////////////////////
async addMedia(campaignId: number, file: Express.Multer.File): Promise<CampaignMedia>  {
    const campaign = await this.findById(campaignId);
    if (!campaign) throw new NotFoundException('Campaign not found');
    
    const media = this.campaignMediaRepository.create({
      url: file.path,
      campaign: campaign,
    });
  
    return this.campaignMediaRepository.save(media);
  }
  
  async getMediaByCampaign(campaignId: number): Promise<CampaignMedia[]> {
    return this.campaignMediaRepository.find({ where: { campaign: { id: campaignId } } });
  }
  
  async deleteMedia(id: number): Promise<void> {
    await this.campaignMediaRepository.delete(id);
  }
  
}
