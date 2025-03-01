/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comments.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // GET /comments/:campaignId: Lấy bình luận theo campaignId
  @Get(':campaignId')
  async getCommentsByCampaign(@Param('campaignId') campaignId: string) {
    return this.commentsService.findByCampaign(parseInt(campaignId, 10));
  }

  // POST /comments: Tạo bình luận mới
  @Post()
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }
}
