/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/users.dto';

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
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Tìm người dùng theo ID
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID "${id}"`);
    }

    return user;
  }

  // Tạo người dùng mới
  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(newUser);
  }
}
