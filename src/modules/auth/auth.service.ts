/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

// Kiểu trả về khi auth thành công
interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Hàm login
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      // Tìm user theo email
      const user = await this.usersService.findByEmail(loginDto.email);
      if (!user) {
        throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      }

      // Kiểm tra mật khẩu
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      }

      // Tạo token
      const payload = { sub: user.id, email: user.email };
      const accessToken = await this.jwtService.signAsync(payload);

      // Bỏ password khi trả về
      const { password, ...result } = user;
      return {
        user: result,
        accessToken,
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Đăng nhập thất bại');
    }
  }

  // Hàm register
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      // Kiểm tra email đã tồn tại chưa
      const existingUser = await this.usersService.findByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new UnauthorizedException('Email đã được sử dụng');
      }

      // Hash mật khẩu
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Tạo user mới
      const newUserData = {
        ...registerDto,
        password: hashedPassword,
      };
      const newUser = await this.usersService.create(newUserData);

      // Tạo token
      const payload = { sub: newUser.id, email: newUser.email };
      const accessToken = await this.jwtService.signAsync(payload);

      // Bỏ password khi trả về
      const { password, ...result } = newUser;
      return {
        user: result,
        accessToken,
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Đăng ký thất bại');
    }
  }

  // Hàm validate token (nếu bạn muốn gọi thủ công thay vì guard)
  async validateToken(token: string): Promise<Omit<User, 'password'>> {
    try {
      // Xác định kiểu payload để tránh lỗi “unsafe-member-access”
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
      }>(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Người dùng không tồn tại');
      }

      const { password, ...result } = user;
      return result;
    } catch (error: unknown) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }
}
