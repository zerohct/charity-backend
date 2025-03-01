import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  // Lấy các bình luận theo campaignId
  async findByCampaign(campaignId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { campaign: { id: campaignId } },
    });
  }

  // Tạo bình luận mới
  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const newComment = this.commentsRepository.create(createCommentDto);
    return this.commentsRepository.save(newComment);
  }
}
