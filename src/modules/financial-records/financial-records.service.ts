/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialRecord } from './entities/financial-record.entity';
import { CreateFinancialRecordDto } from './dto/financial-records.dto';

@Injectable()
export class FinancialRecordsService {
  constructor(
    @InjectRepository(FinancialRecord)
    private recordsRepository: Repository<FinancialRecord>,
  ) {}

  // Lấy tất cả bản ghi tài chính
  async findAll(): Promise<FinancialRecord[]> {
    return this.recordsRepository.find({ relations: ['campaign', 'donation'] });
  }

  // Tạo bản ghi tài chính mới
  async create(
    createRecordDto: CreateFinancialRecordDto,
  ): Promise<FinancialRecord> {
    const newRecord = this.recordsRepository.create(createRecordDto);
    return this.recordsRepository.save(newRecord);
  }
}
