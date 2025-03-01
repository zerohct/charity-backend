/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body } from '@nestjs/common';
import { FinancialRecordsService } from './financial-records.service';
import { CreateFinancialRecordDto } from './dto/financial-records.dto';

@Controller('financial-records')
export class FinancialRecordsController {
  constructor(
    private readonly financialRecordsService: FinancialRecordsService,
  ) {}

  // GET /financial-records: Lấy danh sách bản ghi tài chính
  @Get()
  async getAllRecords() {
    return this.financialRecordsService.findAll();
  }

  // POST /financial-records: Tạo bản ghi tài chính mới
  @Post()
  async createRecord(@Body() createRecordDto: CreateFinancialRecordDto) {
    return this.financialRecordsService.create(createRecordDto);
  }
}
