/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/campaigns.dto';
import { UpdateCampaignDto } from './dto/campaigns.dto';
import { NotFoundException } from '@nestjs/common';
import { CampaignMedia } from './entities/campaign-media.entity';


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

    const targetAmount = Number(body.targetAmount);

    let tagsArray: string[] = [];
    if (body.tags) {
      try {
        if (typeof body.tags === 'string') {
          if (body.tags.startsWith('[') && body.tags.endsWith(']')) {
            tagsArray = JSON.parse(body.tags).map((tag: string) =>
              tag.trim().replace(/^["']+|["']+$/g, ''),
            );
          } else {
            tagsArray = body.tags
              .split(',')
              .map((tag) => tag.trim().replace(/^["']+|["']+$/g, ''));
          }
        } else if (Array.isArray(body.tags)) {
          tagsArray = body.tags.map((tag) =>
            typeof tag === 'string'
              ? tag.trim().replace(/^["']+|["']+$/g, '')
              : String(tag),
          );
        } else {
          throw new BadRequestException('tags must be an array');
        }
      } catch (err) {
        console.error('Error parsing tags:', err);
        throw new BadRequestException('Invalid tags format');
      }
    }
    const newCampaign = this.campaignsRepository.create({
      title: body.title,
      description: body.description || null,
      emoji: body.emoji || null,
      category: body.category || null,
      location: body.location || null,
      tags: tagsArray,
      targetAmount: targetAmount,
      collectedAmount: 0,
      donationCount: 0,
      status: 'pending',
      slug: body.slug || null,
      isFeatured:
        typeof body.isFeatured === 'string'
          ? body.isFeatured.toLowerCase() === 'true'
          : false,
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
  // async update(id: number, updateDto: UpdateCampaignDto): Promise<Campaign> {
  //   if (!updateDto || Object.keys(updateDto).length === 0) {
  //     throw new BadRequestException('Update data is required');
  //   }

  //   const existing = await this.campaignsRepository.findOne({ where: { id } });
  //   if (!existing) {
  //     throw new NotFoundException(`Campaign with ID ${id} not found`);
  //   }

  //   await this.campaignsRepository.update(id, updateDto);

  //   const updated = await this.campaignsRepository.findOne({
  //     where: { id },
  //     relations: ['media'],
  //   });

  //   if (!updated) {
  //     throw new NotFoundException(
  //       `Campaign with ID ${id} not found after update`,
  //     );
  //   }

  //   return updated;
  // }
  async update(
    id: number,
    updateDto: UpdateCampaignDto,
    file?: Express.Multer.File,
  ): Promise<Campaign> {
    if (!updateDto || Object.keys(updateDto).length === 0) {
      throw new BadRequestException('Update data is required');
    }
  
    const existing = await this.campaignsRepository.findOne({
      where: { id },
      relations: ['media'],
    });
  
    if (!existing) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
  
    // Cập nhật thông tin chiến dịch
    const dataToUpdate: any = { ...updateDto };
    if (typeof updateDto.isFeatured === 'string') {
      dataToUpdate.isFeatured = updateDto.isFeatured.toLowerCase() === 'true';
    }
    // Parse tags
    if (typeof updateDto.tags === 'string') {
      if (updateDto.tags.startsWith('[') && updateDto.tags.endsWith(']')) {
        try {
          dataToUpdate.tags = JSON.parse(updateDto.tags).map((tag: string) =>
            tag.trim().replace(/^["']+|["']+$/g, ''),
          );
        } catch (e) {
          dataToUpdate.tags = [];
        }
      } else {
        dataToUpdate.tags = updateDto.tags
          .split(',')
          .map((tag) => tag.trim().replace(/^["']+|["']+$/g, ''));
      }
    }
    await this.campaignsRepository.update(id, dataToUpdate);
    // Nếu có file ảnh mới, convert sang base64 và cập nhật ảnh
    if (file) {
      const fileBuffer = file.buffer.toString('base64');
      const base64Image = `data:${file.mimetype};base64,${fileBuffer}`;
      const matches = base64Image.match(
        /^data:(image|video|audio|application)\/([a-zA-Z0-9]+);base64/,
      );
      const fileExtension = matches ? matches[2] : 'png';
  
      const media = existing.media?.[0]; // giả định 1 ảnh chính
  
      if (media) {
        await this.campaignMediaRepository.update(media.id, {
          base64Image,
          url: `uploads/temp-update.${fileExtension}`,
          updatedAt: new Date(),
        });
      } else {
        await this.campaignMediaRepository.save({
          campaign: existing,
          base64Image,
          mediaType: 'image',
          url: `uploads/temp-update.${fileExtension}`,
          isPrimary: true,
        });
      }
    }
  
    const updated = await this.campaignsRepository.findOne({
      where: { id },
      relations: ['media'],
    });
  
    return updated!;
  }
    

  // Xóa chiến dịch
  async delete(id: number): Promise<void> {
    const campaign = await this.findById(id);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    await this.campaignsRepository.delete(id);
  }

  async search(
    query: string,
    page = 1,
    size = 10,
  ): Promise<{ data: Campaign[]; total: number; page: number; size: number }> {
    if (!query) {
      throw new BadRequestException('Query string cannot be empty');
    }

    try {
      const queryBuilder = this.campaignsRepository
        .createQueryBuilder('campaign')
        .leftJoinAndSelect('campaign.media', 'media') // Load relation media
        .where('LOWER(campaign.title) LIKE LOWER(:query)', {
          query: `%${query}%`,
        })
        .skip((page - 1) * size)
        .take(size)
        .orderBy('campaign.createdAt', 'DESC');

      const [data, total] = await queryBuilder.getManyAndCount();

      return { data, total, page, size };
    } catch (err) {
      logger.error('Search error:', err);
      throw new InternalServerErrorException(
        `Không thể tìm kiếm chiến dịch: ${err.message}`,
      );
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
