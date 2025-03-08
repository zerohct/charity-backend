/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import { RolesService } from '../users/services/role.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service'; // Thêm service để gửi email

interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly rolesService: RolesService,
    private readonly mailService: MailService,
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

      // Kiểm tra xác thực email
      if (!user.emailVerified) {
        throw new UnauthorizedException(
          'Email chưa được xác thực. Vui lòng kiểm tra hộp thư của bạn.',
        );
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
      // Check if email already exists
      const existingUser = await this.usersService.findByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new UnauthorizedException('Email đã được sử dụng');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Create new user with unverified email status
      const newUserData = {
        ...registerDto,
        password: hashedPassword,
        emailVerified: false,
        verificationToken: this.generateVerificationToken(),
      };
      const newUser = await this.usersService.create(newUserData);

      // Assign the default 'user' role to self-registered users
      await this.rolesService.assignRoleToUser(newUser.id, 'user');

      // Send verification email
      await this.mailService.sendVerificationEmail(
        newUser.email,
        newUser.verificationToken,
      );

      // Create token
      const payload = { sub: newUser.id, email: newUser.email };
      const accessToken = await this.jwtService.signAsync(payload);

      // Remove password from response
      const { password, ...result } = newUser;
      return {
        user: result,
        accessToken,
      };
    } catch (error: unknown) {
      console.error('Register error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof Error) {
        throw new UnauthorizedException('Đăng ký thất bại: ' + error.message);
      }

      throw new UnauthorizedException('Đăng ký thất bại: ' + String(error));
    }
  }
  // Hàm xác thực email
  async verifyEmail(token: string): Promise<boolean> {
    try {
      const user = await this.usersService.findByVerificationToken(token);
      if (!user) {
        throw new UnauthorizedException('Token xác thực không hợp lệ');
      }

      // Cập nhật trạng thái xác thực email
      await this.usersService.update(user.id, {
        emailVerified: true,
        verificationToken: null, // Xóa token sau khi xác thực
      });

      return true;
    } catch (error) {
      throw new UnauthorizedException('Xác thực email thất bại');
    }
  }

  // Hàm tạo token xác thực email ngẫu nhiên
  private generateVerificationToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // Gửi lại email xác thực
  async resendVerificationEmail(email: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email không tồn tại');
    }

    if (user.emailVerified) {
      throw new UnauthorizedException('Email đã được xác thực');
    }

    // Tạo token mới nếu cần
    const verificationToken =
      user.verificationToken || this.generateVerificationToken();

    // Cập nhật token nếu cần
    if (!user.verificationToken) {
      await this.usersService.update(user.id, { verificationToken: null });
    }

    // Gửi email xác thực
    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return true;
  }

  // Hàm validate token (nếu bạn muốn gọi thủ công thay vì guard)
  async validateToken(token: string): Promise<Omit<User, 'password'>> {
    try {
      // Xác định kiểu payload để tránh lỗi "unsafe-member-access"
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
