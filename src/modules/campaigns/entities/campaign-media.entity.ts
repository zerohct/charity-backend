/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Campaign } from './campaign.entity';

@Entity('campaign_media')
export class CampaignMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mediaType: string; // Ví dụ: 'image', 'video', 'document'

  @Column()
  url: string;

  @Column({ nullable: true, type: 'text' })
  caption: string;

  @Column({ default: 0 })
  orderIndex: number;

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Campaign, (campaign) => campaign.media)
  campaign: Campaign;
}
