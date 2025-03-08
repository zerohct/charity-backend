import { Injectable } from '@nestjs/common';
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

  // Create user with specific roles by admin
  async createUserWithRoles(
    createUserDto: CreateUserDto,
    roleNames: string[],
  ): Promise<User> {
    const newUser = await this.usersService.create({
      ...createUserDto,
      password:
        createUserDto.password || Math.random().toString(36).substring(2, 15),
      // Admin-created accounts can be pre-verified
      emailVerified: true,
    });

    // Assign roles
    if (roleNames && roleNames.length > 0) {
      await this.rolesService.setUserRoles(newUser.id, roleNames);
    } else {
      // Default to 'user' role if none specified
      await this.rolesService.assignRoleToUser(newUser.id, 'user');
    }

    // Get the user with roles
    return this.usersService.findById(newUser.id);
  }

  // Update user roles
  async updateUserRoles(userId: number, roleNames: string[]): Promise<User> {
    return this.rolesService.setUserRoles(userId, roleNames);
  }

  // Get all users with their roles
  async getAllUsersWithRoles(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
