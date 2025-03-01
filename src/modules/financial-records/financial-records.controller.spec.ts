import { Test, TestingModule } from '@nestjs/testing';
import { FinancialRecordsController } from './financial-records.controller';

describe('FinancialRecordsController', () => {
  let controller: FinancialRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancialRecordsController],
    }).compile();

    controller = module.get<FinancialRecordsController>(FinancialRecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
