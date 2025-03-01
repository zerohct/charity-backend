import { Test, TestingModule } from '@nestjs/testing';
import { FinancialRecordsService } from './financial-records.service';

describe('FinancialRecordsService', () => {
  let service: FinancialRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinancialRecordsService],
    }).compile();

    service = module.get<FinancialRecordsService>(FinancialRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
