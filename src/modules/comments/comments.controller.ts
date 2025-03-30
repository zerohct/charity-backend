/* eslint-disable prettier/prettier */
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UploadedFile, 
  UseInterceptors, 
  ParseIntPipe, 
  HttpStatus, 
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comments.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseApi } from 'src/common/response/response-api';


@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // GET /comments/:campaignId: Lấy bình luận theo campaignId
  @Get(':campaignId')
  async getCommentsByCampaign(@Param('campaignId', ParseIntPipe) campaignId: number) {
    try {
      const comments = await this.commentsService.findByCampaign(campaignId);
      return ResponseApi.success('Lấy danh sách bình luận thành công', comments);
    } catch (error) {
      return ResponseApi.customError(HttpStatus.INTERNAL_SERVER_ERROR, 'Lỗi lấy bình luận');
    }
  }

  // POST /comments - Nhận dữ liệu từ form-data
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createComment(
    @Body() createCommentDto: CreateCommentDto
  ) {
    try {
      const newComment = await this.commentsService.create(createCommentDto);
      return ResponseApi.success('Tạo bình luận thành công', newComment, HttpStatus.CREATED);
    } catch (error) {
      return ResponseApi.customError(HttpStatus.INTERNAL_SERVER_ERROR, 'Lỗi khi tạo bình luận');
    }
  }
}
