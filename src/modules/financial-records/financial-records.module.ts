import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialRecordsController } from './financial-records.controller';
import { FinancialRecordsService } from './financial-records.service';
import { FinancialRecord } from './entities/financial-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialRecord])],
  controllers: [FinancialRecordsController],
  providers: [FinancialRecordsService],
})
export class FinancialRecordsModule {}
