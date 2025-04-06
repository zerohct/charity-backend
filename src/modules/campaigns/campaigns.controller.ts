/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/campaigns.dto';
import { UpdateCampaignDto } from './dto/campaigns.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseApi } from 'src/common/response/response-api';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // GET /campaigns: Lấy danh sách các chiến dịch
  @Get()
  async getAllCampaigns() {
    try {
      const data = await this.campaignsService.findAll();

      if (!data || data.length === 0) {
        return ResponseApi.error404('Không có chiến dịch nào!');
      }

      return ResponseApi.success('Lấy danh sách thành công', data);
    } catch (error) {
      console.error(error);
      return ResponseApi.customError(500, 'Lỗi khi lấy danh sách chiến dịch');
    }
  }

  @Get(':id')
  async getCampaignById(@Param('id') id: number) {
    try {
      const data = await this.campaignsService.findById(id);
      return ResponseApi.success('Lấy chi tiết chiến dịch thành công', data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseApi.error(error.message, HttpStatus.NOT_FOUND);
      }
      // fallback cho các lỗi khác
      return ResponseApi.error(
        'Đã có lỗi xảy ra',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // POST /campaigns: Tạo một chiến dịch mới
  // @Post()
  // async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
  //   return this.campaignsService.create(createCampaignDto);
  // }
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createCampaign(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateCampaignDto,
  ) {
    try {
      const data = await this.campaignsService.create(body, file);
      return ResponseApi.success(
        'Tạo chiến dịch thành công',
        data,
        HttpStatus.CREATED,
      );
    } catch (err) {
      return ResponseApi.error(
        err.message,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/media')
  async uploadMedia(
    @Param('id') id: string,
    @Body('base64Image') base64Image: string,
  ) {
    const campaignId = parseInt(id, 10);
    if (isNaN(campaignId)) {
      return ResponseApi.error('ID không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    try {
      const media = await this.campaignsService.addMedia(
        campaignId,
        base64Image,
      );
      return ResponseApi.success('Tải ảnh lên thành công', media);
    } catch (err) {
      return ResponseApi.error(
        err.message,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async updateCampaign(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    const campaignId = parseInt(id, 10);
    if (isNaN(campaignId)) {
      return ResponseApi.error('ID không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    try {
      const updated = await this.campaignsService.update(
        campaignId,
        updateCampaignDto,
      );
      return ResponseApi.success('Cập nhật chiến dịch thành công', updated);
    } catch (err) {
      return ResponseApi.error(
        err.message,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteCampaign(@Param('id') id: string) {
    const campaignId = parseInt(id, 10);
    if (isNaN(campaignId)) {
      return ResponseApi.error('ID không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.campaignsService.delete(campaignId);
      return ResponseApi.success(`Đã xoá chiến dịch ID ${campaignId}`, null);
    } catch (error) {
      // Check lỗi khoá ngoại (liên quan bảng khác như comments)
      if (error.code === '23503') {
        return ResponseApi.error(
          'Không thể xoá vì còn dữ liệu liên quan',
          HttpStatus.BAD_REQUEST,
        );
      }

      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Lỗi xoá chiến dịch',
      );
    }
  }
  //BUG
  @Get('search')
  async searchCampaigns(
    @Query('query') query: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    if (!query) {
      return ResponseApi.error(
        'Từ khoá tìm kiếm không được để trống',
        HttpStatus.BAD_REQUEST,
      );
    }

    const currentPage = parseInt(page || '1', 10);
    const pageSize = parseInt(size || '10', 10);

    try {
      const { data, total, page, size } = await this.campaignsService.search(
        query,
        currentPage,
        pageSize,
      );
      return ResponseApi.success('Tìm kiếm thành công', {
        total,
        page,
        size,
        data,
      });
    } catch (err) {
      return ResponseApi.error(
        err.message,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
