/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './entities/donation.entity';
import { CreateDonationDto } from './dto/donations.dto';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationsRepository: Repository<Donation>,
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
}
