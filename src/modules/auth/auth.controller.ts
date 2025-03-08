import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

// Import ResponseApi
import { ResponseApi, ICustomResponse } from 'src/common/response/response-api';
// (Nếu vẫn muốn xài ApiResponse cũ, import { ApiResponse } from 'src/common/interfaces/api-response.interface';)

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/login
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'email', maxCount: 1 },
      { name: 'password', maxCount: 1 },
    ]),
  )
  async login(
    @UploadedFiles() files,
    @Body() body,
  ): Promise<ICustomResponse<any>> {
    try {
      // Lấy dữ liệu từ body (hoặc FormData)
      const loginDto: LoginDto = {
        email: body.email,
        password: body.password,
      };

      const result = await this.authService.login(loginDto);

      // Trả về thành công
      return ResponseApi.success('Login successful', result, HttpStatus.OK);
    } catch (error) {
      // Trả về lỗi
      // Tuỳ bạn dùng `ResponseApi.customError()`, `ResponseApi.error()`, v.v.
      return ResponseApi.customError(
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'Something went wrong',
      );
    }
  }

  // POST /auth/register
  @Post('register')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'email', maxCount: 1 },
      { name: 'password', maxCount: 1 },
      { name: 'firstName', maxCount: 1 },
      { name: 'lastName', maxCount: 1 },
    ]),
  )
  async register(
    @UploadedFiles() files,
    @Body() body,
  ): Promise<ICustomResponse<any>> {
    try {
      const registerDto: RegisterDto = {
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
      };

      const result = await this.authService.register(registerDto);

      return ResponseApi.success(
        'Register successful',
        result,
        HttpStatus.CREATED,
      );
    } catch (error) {
      return ResponseApi.customError(
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'Something went wrong',
      );
    }
  }

  // GET /auth/verify/:token
  @Get('verify/:token')
  async verifyEmail(
    @Param('token') token: string,
  ): Promise<ICustomResponse<boolean>> {
    try {
      const result = await this.authService.verifyEmail(token);
      return ResponseApi.success('Email verified successfully', result);
    } catch (error) {
      return ResponseApi.customError(
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'Something went wrong',
      );
    }
  }

  // POST /auth/resend-verification
  @Post('resend-verification')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'email', maxCount: 1 }]))
  async resendVerification(@Body() body): Promise<ICustomResponse<boolean>> {
    try {
      const result = await this.authService.resendVerificationEmail(body.email);
      return ResponseApi.success(
        'Verification email resent successfully',
        result,
      );
    } catch (error) {
      return ResponseApi.customError(
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'Something went wrong',
      );
    }
  }

  // GET /auth/profile
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req): ICustomResponse<any> {
    try {
      return ResponseApi.success('Profile fetched successfully', req.user);
    } catch (error) {
      return ResponseApi.customError(
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'Something went wrong',
      );
    }
  }
}
