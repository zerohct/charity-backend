/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/login: Đăng nhập người dùng
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ user: any; accessToken: string }> {
    return this.authService.login(loginDto);
  }

  // POST /auth/register: Đăng ký người dùng
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ user: any; accessToken: string }> {
    return this.authService.register(registerDto);
  }

  // GET /auth/profile: Lấy thông tin người dùng hiện tại từ token
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req): any {
    return req.user;
  }
}
