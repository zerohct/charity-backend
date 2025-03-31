import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesService } from './role.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/users.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  async createUserWithRoles(
    createUserDto: CreateUserDto,
    roleNames: string[],
  ): Promise<User> {
    const newUser = await this.usersService.create({
      ...createUserDto,
      password:
        createUserDto.password || Math.random().toString(36).substring(2, 15),
      emailVerified: true,
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
    return this.usersService.update(userId, updateUserDto);
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
}
