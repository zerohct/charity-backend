/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Campaign } from '../../campaigns/entities/campaign.entity';
import { Donation } from '../../donations/entities/donation.entity';

@Entity('financial_records')
export class FinancialRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  transactionType: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @CreateDateColumn({ name: 'transaction_date' })
  transactionDate: Date;

  @ManyToOne(() => Campaign, (campaign) => campaign.financialRecords)
  campaign: Campaign;

  @ManyToOne(() => Donation, { nullable: true })
  donation: Donation;
}
