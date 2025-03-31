import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AdminUsersService } from '../services/admin-users.service';
import { RequireRoles } from '../decorators/require-roles.decorator';
import { ICustomResponse, ResponseApi } from 'src/common/response/response-api';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/users.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

@Controller('admin/users')
@RequireRoles('admin')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async getAllUsers(): Promise<ICustomResponse<User[]>> {
    try {
      const users = await this.adminUsersService.getAllUsersWithRoles();
      return ResponseApi.success('Users retrieved successfully', users);
    } catch {
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to fetch users',
      );
    }
  }

  @Post()
  async createUser(
    @Body() createDto: { user: CreateUserDto; roles: string[] },
  ): Promise<ICustomResponse<User>> {
    try {
      const user = await this.adminUsersService.createUserWithRoles(
        createDto.user,
        createDto.roles,
      );
      return ResponseApi.success(
        'User created successfully',
        user,
        HttpStatus.CREATED,
      );
    } catch {
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create user',
      );
    }
  }

  @Put(':id')
  async updateUser(
    @Param('id') userId: number,
    @Body() updateDto: Partial<CreateUserDto>,
  ): Promise<ICustomResponse<User>> {
    try {
      const user = await this.adminUsersService.updateUser(userId, updateDto);
      return ResponseApi.success('User updated successfully', user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseApi.error404(error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update user',
      );
    }
  }

  @Put(':id/roles')
  async updateUserRoles(
    @Param('id') userId: number,
    @Body() { roles }: { roles: string[] },
  ): Promise<ICustomResponse<User>> {
    try {
      const user = await this.adminUsersService.updateUserRoles(userId, roles);
      return ResponseApi.success('User roles updated successfully', user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseApi.error404(error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update user roles',
      );
    }
  }

  @Delete(':id')
  async deleteUser(
    @Param('id') userId: number,
    @Request() req,
  ): Promise<ICustomResponse<boolean>> {
    try {
      const result = await this.adminUsersService.deleteUser(userId, req.user);
      return ResponseApi.success('User deleted successfully', result);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseApi.error404(error.message);
      }
      if (error instanceof UnauthorizedException) {
        return ResponseApi.customError(HttpStatus.FORBIDDEN, error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete user',
      );
    }
  }
}
