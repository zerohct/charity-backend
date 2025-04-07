import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesService } from './role.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/users.dto';
import { UpdateUserDto } from '../dto/users.dto';

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
  
    if (roleNames && roleNames.length > 0) {
      await this.rolesService.setUserRoles(newUser.id, roleNames);
    } else {
      await this.rolesService.assignRoleToUser(newUser.id, 'user');
    }
  
    return this.usersService.findById(newUser.id);
  }
  
  async updateUser(
    userId: number,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<User> {
    // Chuyển avatar null => undefined
    const cleanDto: Partial<UpdateUserDto> = {
      ...updateUserDto,
      avatar:
        updateUserDto.avatar === null ? undefined : updateUserDto.avatar,
    };
  
    return this.usersService.update(userId, cleanDto);
  }
  

  async updateUserRoles(userId: number, roleNames: string[]): Promise<User> {
    return this.rolesService.setUserRoles(userId, roleNames);
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
