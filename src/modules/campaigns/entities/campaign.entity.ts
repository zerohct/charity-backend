/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CampaignMedia } from './campaign-media.entity';
import { Donation } from '../../donations/entities/donation.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { FinancialRecord } from '../../financial-records/entities/financial-record.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ length: 10, nullable: true })
  emoji: string;

  @Column({ nullable: true })
  category: string;

  // Lưu danh sách tag dưới dạng JSON (array of strings)
  @Column('simple-json', { nullable: true })
  tags: string[];

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  targetAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  collectedAmount: number;

  @Column({ default: 0 })
  donationCount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ unique: true, nullable: true })
  slug: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Người tạo chiến dịch
  @ManyToOne(() => User, (user) => user.campaigns)
  createdBy: User;

  // Quan hệ với các media của chiến dịch
  @OneToMany(() => CampaignMedia, (media) => media.campaign, { cascade: true })
  media: CampaignMedia[];

  @OneToMany(() => Donation, (donation) => donation.campaign)
  donations: Donation[];

  @OneToMany(() => Comment, (comment) => comment.campaign)
  comments: Comment[];

  @OneToMany(() => FinancialRecord, (record) => record.campaign)
  financialRecords: FinancialRecord[];
}
