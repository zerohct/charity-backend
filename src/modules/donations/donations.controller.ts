/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/donations.dto';
import { Request } from 'express';
import { Response } from 'express';
import { Res } from '@nestjs/common/decorators/http/route-params.decorator';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { AuthGuard } from '@nestjs/passport';

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

  @Post('vnpay/create')
  async createVnpay(@Body() dto: CreateDonationDto, @Req() req: Request) {
    return this.donationsService.createVnpayPayment(dto, req);
  }

  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    const isValid = this.donationsService.verifyVnpaySignature(query);
    if (isValid && query.vnp_ResponseCode === '00') {
      //Hiển thị: thành công
      return res.redirect('/donation-success'); // hoặc render thông báo
    } else {
      //Hiển thị: thất bại
      return res.redirect('/donation-fail');
    }
  }

  @Get('vnpay-ipn')
  async vnpayIpn(@Query() query: any, @Res() res: Response) {
    const result = await this.donationsService.handleVnpayIpn(query);
    return res.status(200).json(result);
  }

  //MOMO
  @UseGuards(AuthGuard('jwt')) //BUG
  @Post('momo-create')
  createMomo(@Body() dto: CreateDonationDto, @Req() req: Request) {
    const user = req.user as { id: number }; // 👈 ép kiểu để khỏi báo lỗi
    dto.donorId = user.id;
    return this.donationsService.createMomoPayment(dto);
  }
  @Get('momo-return')
  async handleMomoReturn(@Query() query: any) {
    return this.donationsService.handleMomoReturn(query);
  }
  @Post('momo-ipn')
  handleMomoIpn(@Body() body: any) {
    return this.donationsService.handleMomoIpn(body);
  }
}
