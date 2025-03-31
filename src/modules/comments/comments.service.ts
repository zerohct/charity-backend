import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/comments.dto';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { User } from '../users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,

    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Lấy các bình luận theo campaignId
  async findByCampaign(campaignId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { campaign: { id: campaignId } },
    });
  }

  // Tạo bình luận mới
  // async create(createCommentDto: CreateCommentDto): Promise<Comment> {
  //   const newComment = this.commentsRepository.create(createCommentDto);
  //   return this.commentsRepository.save(newComment);
  // }
  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const { content, rating, campaignId, userId } = createCommentDto;

    const campaign = await this.campaignsRepository.findOne({
      where: { id: campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const newComment = this.commentsRepository.create({
      content,
      rating,
      campaign,
      user,
    });

    return this.commentsRepository.save(newComment);
  }
}
