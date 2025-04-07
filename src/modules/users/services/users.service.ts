import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Lấy tất cả người dùng
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['roles'] });
  }

  // Tìm người dùng theo email
  // Tìm người dùng theo email (for registration checks)
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
    return user || null; // Trả về null nếu không tìm thấy
  }

  // Tìm người dùng theo số điện thoại
  async findByPhone(phone: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { phone },
      relations: ['roles'],
    });
    return user || null;
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { verificationToken: token },
      relations: ['roles'],
    });
    return user || null;
  }
  // Tìm người dùng theo ID
  async findById(id: number, relations: string[] = []): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      //relations: relations,
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // Tạo người dùng mới
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (existingUser) {
        throw new UnauthorizedException('Email đã được sử dụng');
      }
      if (createUserDto.password) {
        createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
      }

      const newUser = this.usersRepository.create(createUserDto);
      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Không thể tạo người dùng: ${error.message}`);
    }
  }

  // Cập nhật người dùng
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Hash password mới nếu có
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  // Xóa người dùng
  async delete(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
