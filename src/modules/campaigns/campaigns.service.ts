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
import { DeepPartial } from 'typeorm';
import { Logger } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { Express } from 'express';

const logger = new Logger('CampaignsService');

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
  async create(
    body: CreateCampaignDto,
    file?: Express.Multer.File,
  ): Promise<Campaign> {
    console.log('Received body:', body);

    if (!body.title) {
      throw new BadRequestException('Title is required');
    }
    if (!body.targetAmount) {
      throw new BadRequestException('targetAmount is required');
    }

    let base64Image: string | null = null;
    if (file) {
      const fileBuffer = file.buffer.toString('base64');
      base64Image = `data:${file.mimetype};base64,${fileBuffer}`;
    }

    // Ép kiểu số cho targetAmount đã được xử lý bởi @Type trong DTO nhưng vẫn an toàn
    const targetAmount = Number(body.targetAmount);

    // Tạo campaign mới với các field bổ sung
    const newCampaign = this.campaignsRepository.create({
      title: body.title,
      description: body.description || null,
      emoji: body.emoji || null,
      category: body.category || null,
      location: body.location || null,
      tags:
        body.tags && typeof body.tags === 'string'
          ? JSON.parse(body.tags)
          : body.tags || [],
      targetAmount: targetAmount,
      collectedAmount: 0,
      donationCount: 0,
      status: 'pending',
      slug: body.slug || null,
      // Nếu isFeatured được gửi lên là chuỗi thì chuyển thành boolean (DTO đã ép kiểu, nhưng dự phòng)
      isFeatured:
        typeof body.isFeatured === 'string'
          ? body.isFeatured === 'true'
          : !!body.isFeatured,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      deadline: body.deadline ? new Date(body.deadline) : null,
    } as DeepPartial<Campaign>);

    const savedCampaign = await this.campaignsRepository.save(newCampaign);

    if (base64Image) {
      const matches = base64Image.match(
        /^data:(image|video|audio|application)\/([a-zA-Z0-9]+);base64,/,
      );
      const mediaType = matches ? matches[1] : 'image';
      const fileExtension = matches ? matches[2] : 'png';

      const media = this.campaignMediaRepository.create({
        mediaType: mediaType,
        url: `uploads/temp-file.${fileExtension}`,
        base64Image: base64Image,
        campaign: savedCampaign,
        isPrimary: true,
      } as DeepPartial<CampaignMedia>);

      await this.campaignMediaRepository.save(media);
    }

    return savedCampaign;
  }

  //Tìm chiến dịch theo ID
  async findById(id: number): Promise<Campaign> {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid campaign ID');
    }

    const campaign = await this.campaignsRepository.findOne({
      where: { id },
      relations: ['media'],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  // Cập nhật chiến dịch
  async update(id: number, updateDto: UpdateCampaignDto): Promise<Campaign> {
    if (!updateDto || Object.keys(updateDto).length === 0) {
      throw new BadRequestException('Update data is required');
    }

    // Kiểm tra campaign tồn tại
    const existing = await this.campaignsRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    // Cập nhật
    await this.campaignsRepository.update(id, updateDto);

    // Truy vấn lại bản đã cập nhật kèm media
    const updated = await this.campaignsRepository.findOne({
      where: { id },
      relations: ['media'],
    });

    if (!updated) {
      throw new NotFoundException(
        `Campaign with ID ${id} not found after update`,
      );
    }

    return updated;
  }

  // Xóa chiến dịch
  async delete(id: number): Promise<void> {
    const campaign = await this.findById(id);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    await this.campaignsRepository.delete(id);
  }

  //BUG
  // Tìm kiếm chiến dịch theo tiêu đề
  async search(
    query: string,
    page = 1,
    size = 10,
  ): Promise<{ data: Campaign[]; total: number }> {
    if (!query) {
      throw new BadRequestException('Query string cannot be empty');
    }

    try {
      const [data, total] = await this.campaignsRepository.findAndCount({
        where: { title: ILike(`%${query}%`) },
        skip: (page - 1) * size,
        take: size,
        order: { createdAt: 'DESC' },
      });

      return { data, total };
    } catch (err) {
      console.error('Lỗi khi tìm kiếm campaign:', err);
      throw new InternalServerErrorException('Không thể tìm kiếm chiến dịch');
    }
  }

  // Lưu media dưới dạng Base64 vào bảng CampaignMedia
  async addMedia(
    campaignId: number,
    base64Image: string,
  ): Promise<CampaignMedia> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (!base64Image.startsWith('data:image/')) {
      throw new BadRequestException('Invalid image format');
    }

    const media = this.campaignMediaRepository.create({
      base64Image,
      campaign,
    });

    return this.campaignMediaRepository.save(media);
  }

  async getMediaByCampaign(campaignId: number): Promise<CampaignMedia[]> {
    return this.campaignMediaRepository.find({
      where: { campaign: { id: campaignId } },
    });
  }

  async deleteMedia(id: number): Promise<void> {
    await this.campaignMediaRepository.delete(id);
  }
}
