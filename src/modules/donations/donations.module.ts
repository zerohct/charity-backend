import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { Donation } from './entities/donation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donation])],
  controllers: [DonationsController],
  providers: [DonationsService],
})
export class DonationsModule {}
