/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

// DTO để tạo người dùng mới
export class CreateUserDto {
  @IsEmail()
  email: string;

  // Nếu người dùng đăng ký bằng email/mật khẩu, yêu cầu mật khẩu tối thiểu 6 ký tự
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // Các trường khác có thể thêm theo nhu cầu
}
