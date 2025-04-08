/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './entities/donation.entity';
import { CreateDonationDto } from './dto/donations.dto';
import { Request } from 'express';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import axios from 'axios';
import * as qs from 'qs';
import * as crypto from 'crypto';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationsRepository: Repository<Donation>,

    @InjectRepository(Campaign) // <-- THÊM DÒNG NÀY
    private campaignRepository: Repository<Campaign>, // <-- KHAI BÁO BIẾN
  ) {}

  // Lấy danh sách giao dịch ủng hộ
  async findAll(): Promise<Donation[]> {
    return this.donationsRepository.find({ relations: ['campaign', 'donor'] });
  }

  // Tạo giao dịch ủng hộ mới
  async create(createDonationDto: CreateDonationDto): Promise<Donation> {
    const newDonation = this.donationsRepository.create(createDonationDto);
    return this.donationsRepository.save(newDonation);
  }

  async createVnpayPayment(dto: CreateDonationDto, req: Request) {
    const tmnCode = process.env.VNP_TMNCODE as string;
    const secretKey = process.env.VNP_HASHSECRET as string;
    const vnpUrl = process.env.VNP_URL as string;
    const returnUrl = process.env.VNP_RETURN_URL as string;

    const date = new Date();
    const createDate = date
      .toISOString()
      .replace(/[-T:Z.]/g, '')
      .slice(0, 14);
    const orderId = Date.now().toString();
    const ipAddr = '127.0.0.1';

    const amount = (dto.amount * 100).toString(); 

    // Thêm extraData nếu muốn gửi campaignId, donorId
    const extraData = Buffer.from(
      JSON.stringify({
        campaignId: dto.campaignId,
        donorId: dto.donorId,
      }),
    ).toString('base64');
    const expireDate = new Date(date.getTime() + 15 * 60 * 1000)
      .toISOString()
      .replace(/[-T:Z.]/g, '')
      .slice(0, 14);
    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan campaign ${dto.campaignId}`, 
      vnp_OrderType: 'donation',
      vnp_Amount: amount,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: '127.0.0.1', 
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
      vnp_ExtraData: extraData,
    };

    // Bắt buộc phải sort key theo alphabet
    const sortedParams = Object.keys(params)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = params[key];
          return acc;
        },
        {} as Record<string, string>,
      );

    // Tạo chữ ký đúng chuẩn
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(signData, 'utf-8').digest('hex');

    // Thêm chữ ký vào cuối
    sortedParams.vnp_SecureHash = signed;

    // Trả về URL đầy đủ
    const redirectUrl = `${vnpUrl}?${qs.stringify(sortedParams, { encode: false })}`;
    console.log('VNPay redirect URL:', redirectUrl);
    console.log('VNPay TMN:', tmnCode);
    console.log('VNPay SECRET:', secretKey);
    return { payUrl: redirectUrl };
  }

  async handleVnpayReturn(query: any) {
    const secretKey = process.env.VNP_HASHSECRET;
    const receivedHash = query.vnp_SecureHash;
    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    const sortedParams = Object.keys(query)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = query[key];
          return acc;
        },
        {} as Record<string, string>,
      );

    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey as string);
    const calculatedHash = hmac.update(signData).digest('hex');

    if (receivedHash !== calculatedHash) {
      return { message: 'Sai chữ ký hash, giao dịch không hợp lệ!' };
    }

    // Giao dịch thành công
    if (query.vnp_ResponseCode === '00') {
      const amount = Number(query.vnp_Amount) / 100;
      const campaignId = parseInt(query.vnp_OrderInfo.split(' ')[2]);
      const donorId = 1; 

      // Tạo bản ghi donation
      const donation = this.donationsRepository.create({
        amount,
        status: 'success',
        paymentMethod: 'vnpay',
        transactionId: query.vnp_TransactionNo,
        campaign: { id: campaignId } as any,
        donor: { id: donorId } as any,
      });

      await this.donationsRepository.save(donation);

      // Cập nhật collectedAmount cho chiến dịch
      await this.campaignRepository.increment(
        { id: campaignId },
        'collectedAmount',
        amount,
      );

      return { message: 'Thanh toán thành công và đã ghi nhận!' };
    }

    return { message: 'Thanh toán thất bại!' };
  }

  async handleVnpayIpn(query: any) {
    const isValid = this.verifyVnpaySignature(query);
    if (!isValid) {
      return { RspCode: '97', Message: 'Fail checksum' };
    }

    const isSuccess =
      query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00';
    if (!isSuccess) {
      return { RspCode: '01', Message: 'Transaction not successful' };
    }

    const amount = Number(query.vnp_Amount) / 100;
    const transactionId = query.vnp_TransactionNo;
    const extraData = query.vnp_ExtraData;

    let campaignId = 0;
    let donorId = 0;

    try {
      const decoded = JSON.parse(Buffer.from(extraData, 'base64').toString());
      campaignId = decoded.campaignId;
      donorId = decoded.donorId;
    } catch (err) {
      return { RspCode: '98', Message: 'Invalid extraData' };
    }

    // Kiểm tra nếu donation này đã tồn tại (theo transactionId) để tránh lưu trùng
    const existed = await this.donationsRepository.findOne({
      where: { transactionId },
    });

    if (existed) {
      return { RspCode: '02', Message: 'Transaction already processed' };
    }

    
    const donation = this.donationsRepository.create({
      amount,
      paymentMethod: 'vnpay',
      transactionId,
      status: 'success',
      campaign: { id: campaignId } as any,
      donor: { id: donorId } as any,
    });

    await this.donationsRepository.save(donation);

    //Cập nhật số tiền đã quyên góp của chiến dịch
    await this.campaignRepository.increment(
      { id: campaignId },
      'collectedAmount',
      amount,
    );

    return { RspCode: '00', Message: 'Success' };
  }

  verifyVnpaySignature(query: any): boolean {
    const secretKey = process.env.VNP_HASHSECRET;
    if (!secretKey) {
      throw new Error(
        'VNP_HASHSECRET is not defined in environment variables.',
      );
    }
    const secureHash = query.vnp_SecureHash;

    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    const sortedParams = Object.keys(query)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = query[key];
          return acc;
        },
        {} as Record<string, string>,
      );

    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(signData, 'utf-8').digest('hex');

    return secureHash === signed;
  }

  /////////////////////////////////////////////////////////////////////////
  async createMomoPayment(dto: CreateDonationDto) {
    //Validate campaign
    const campaign = await this.campaignRepository.findOne({
      where: { id: dto.campaignId },
    });
    if (!campaign) {
      throw new NotFoundException('Chiến dịch không tồn tại');
    }

    //Validate donor

    const partnerCode = process.env.MOMO_PARTNER_CODE!;
    const accessKey = process.env.MOMO_ACCESS_KEY!;
    const secretKey = process.env.MOMO_SECRET_KEY!;
    const redirectUrl = process.env.MOMO_REDIRECT_URL!;
    const ipnUrl = process.env.MOMO_NOTIFY_URL || ''; 

    const orderId = Date.now().toString();
    const requestId = orderId;
    const amount = dto.amount.toString();

    const extraData = Buffer.from(
      JSON.stringify({
        campaignId: dto.campaignId,
        donorId: dto.donorId,
      }),
    ).toString('base64');

    const orderInfo = `Thanh toan donation ${dto.campaignId}`;

    //Chuỗi ký đúng thứ tự theo tài liệu Momo
    const rawSignature = [
      `accessKey=${accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      ipnUrl ? `ipnUrl=${ipnUrl}` : null,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${partnerCode}`,
      `redirectUrl=${redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=captureWallet`,
    ]
      .filter(Boolean)
      .join('&');

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType: 'captureWallet',
      lang: 'vi',
      signature,
    };

    const response = await axios.post(
      'https://test-payment.momo.vn/v2/gateway/api/create',
      requestBody,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    return { payUrl: response.data.payUrl };
  }

  /// Xử lý redirect từ Momo
  /// Chú ý: Momo sẽ gửi lại các thông tin như orderId, requestId, resultCode, message
  async handleMomoReturn(query: any) {
    if (query.resultCode === '0') {
      
      const extra = JSON.parse(
        Buffer.from(query.extraData, 'base64').toString(),
      );
      const { campaignId, donorId } = extra;

      
      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId },
      });

      if (!campaign) throw new NotFoundException('Chiến dịch không tồn tại');

      campaign.collectedAmount += +query.amount;
      await this.campaignRepository.save(campaign);

      
      const donation = this.donationsRepository.create({
        campaign: { id: campaignId },
        donor: { id: donorId },
        amount: +query.amount,
        paymentMethod: 'momo',
        status: 'success',
      });
      await this.donationsRepository.save(donation);

      return { message: 'Thanh toán thành công', donation };
    } else {
      return { message: 'Thanh toán thất bại', resultCode: query.resultCode };
    }
  }

  //Xử lý IPN từ Momo
  async handleMomoIpn(body: any) {
    const secretKey = process.env.MOMO_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        'MOMO_SECRET_KEY is not defined in environment variables',
      );
    }

    const rawSignature = `amount=${body.amount}&extraData=${body.extraData}&message=${body.message}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`;

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== body.signature) {
      return { resultCode: 1, message: 'Signature mismatch' };
    }

    if (body.resultCode === 0) {
      const { campaignId, donorId } = JSON.parse(
        Buffer.from(body.extraData, 'base64').toString(),
      );

      const existed = await this.donationsRepository.findOne({
        where: { transactionId: body.transId },
      });

      if (existed) {
        return { resultCode: 0, message: 'Already processed' };
      }

      const donation = this.donationsRepository.create({
        amount: body.amount,
        transactionId: body.transId,
        paymentMethod: 'momo',
        status: 'success',
        campaign: { id: campaignId } as any,
        donor: { id: donorId } as any,
      });

      await this.donationsRepository.save(donation);
      await this.campaignRepository.increment(
        { id: campaignId },
        'collectedAmount',
        body.amount,
      );

      return { resultCode: 0, message: 'Success' };
    }

    return { resultCode: 1, message: 'Failed transaction' };
  }
}
