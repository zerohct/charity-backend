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
import { User } from '../../users/entities/user.entity';

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn({ name: 'donated_at' })
  donatedAt: Date;

  @ManyToOne(() => Campaign, (campaign) => campaign.donations)
  campaign: Campaign;

  @ManyToOne(() => User, (user) => user.donations)
  donor: User;
}
