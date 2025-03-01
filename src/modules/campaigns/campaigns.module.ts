import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { Campaign } from './entities/campaign.entity';
import { CampaignMedia } from './entities/campaign-media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, CampaignMedia])],
  controllers: [CampaignsController],
  providers: [CampaignsService],
})
export class CampaignsModule {}
