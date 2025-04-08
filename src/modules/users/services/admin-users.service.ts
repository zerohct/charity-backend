import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesService } from './role.service';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/users.dto';
// import { UpdateUserDto } from '../dto/users.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  async createUserWithRolesAndImage(
    createUserDto: CreateUserDto,
    roleNames: string[],
    profileImage?: string,
  ): Promise<User> {
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: createUserDto.password || Math.random().toString(36).slice(2),
      emailVerified: true,
      avatar: profileImage,
    });

    const normalizedRoleNames = roleNames.map((role) => role.toLowerCase());

    if (normalizedRoleNames && normalizedRoleNames.length > 0) {
      await this.rolesService.setUserRoles(newUser.id, normalizedRoleNames);
    } else {
      await this.rolesService.assignRoleToUser(newUser.id, 'user');
    }

    return this.usersService.findById(newUser.id);
  }

  async updateUser(
    userId: number,
    updateDto: Partial<UpdateUserDto>,
  ): Promise<User> {
    try {
      // Kiểm tra xem user có tồn tại không
      const existingUser = await this.usersService.findById(userId);
      if (!existingUser) {
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }

      // Chuẩn hóa dữ liệu: loại bỏ null không mong muốn, giữ nguyên các trường không gửi
      const cleanDto: Partial<UpdateUserDto> = {
        ...updateDto,
        avatar: updateDto.avatar === null ? undefined : updateDto.avatar,
      };

      // Nếu email được gửi và khác với email hiện tại, kiểm tra xem email đã tồn tại chưa
      if (cleanDto.email && cleanDto.email !== existingUser.email) {
        const emailExists = await this.usersService.findByEmail(cleanDto.email);
        if (emailExists && emailExists.id !== userId) {
          throw new UnauthorizedException('Email đã được sử dụng');
        }
      }

      // Cập nhật thông tin user
      const updatedUser = await this.usersService.update(userId, cleanDto);

      return updatedUser;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // async updateUser(
  //   userId: number,
  //   updateUserDto: Partial<UpdateUserDto>,
  //   roleNames?: string[], // Có thể truyền vào vai trò mới nếu cần
  // ): Promise<User> {
  //   // Chuyển avatar null => undefined
  //   const cleanDto: Partial<UpdateUserDto> = {
  //     ...updateUserDto,
  //     avatar: updateUserDto.avatar === null ? undefined : updateUserDto.avatar,
  //   };

  //   // Cập nhật thông tin người dùng
  //   const updatedUser = await this.usersService.update(userId, cleanDto);

  //   // Nếu có yêu cầu cập nhật vai trò, thực hiện việc cập nhật
  //   if (roleNames && roleNames.length > 0) {
  //     const normalizedRoleNames = roleNames.map((role) => role.toLowerCase());
  //     await this.rolesService.setUserRoles(updatedUser.id, normalizedRoleNames);
  //   }

  //   // Trả về người dùng sau khi cập nhật
  //   return this.usersService.findById(updatedUser.id);
  // }

  async updateUserRoles(userId: number, roleNames: string[]): Promise<User> {
    const normalizedRoleNames = roleNames.map((role) => role.toLowerCase());
    return this.rolesService.setUserRoles(userId, normalizedRoleNames);
  }

  async deleteUser(userId: number, requestingUser: User): Promise<boolean> {
    if (requestingUser.id === userId) {
      throw new UnauthorizedException('Admins cannot delete their own account');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    await this.usersService.delete(userId);
    return true;
  }

  async getAllUsersWithRoles(): Promise<User[]> {
    return this.usersService.findAll();
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }
}
