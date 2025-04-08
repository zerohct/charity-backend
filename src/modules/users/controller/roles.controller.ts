// RolesController
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RolesService } from '../services/role.service';
import { RequireRoles } from '../decorators/require-roles.decorator';
import { ICustomResponse, ResponseApi } from 'src/common/response/response-api';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';

@Controller('admin/roles')
@RequireRoles('admin') // Giữ nguyên kiểm tra role admin cho toàn bộ controller
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getAllRoles(): Promise<ICustomResponse<Role[]>> {
    try {
      const roles = await this.rolesService.findAll();
      return ResponseApi.success('Roles retrieved successfully', roles);
    } catch {
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to fetch roles',
      );
    }
  }

  @Get(':id')
  async getRoleById(
    @Param('id') roleId: number,
  ): Promise<ICustomResponse<Role>> {
    try {
      const role = await this.rolesService.findById(roleId);
      return ResponseApi.success('Role retrieved successfully', role);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseApi.error404(error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to fetch role',
      );
    }
  }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([])) // Thêm interceptor để xử lý form-data
  async createRole(
    @Body() body: any, // Sử dụng any để nhận FormData
  ): Promise<ICustomResponse<Role>> {
    try {
      const name = body.name;
      const description = body.description;

      if (!name) {
        return ResponseApi.customError(
          HttpStatus.BAD_REQUEST,
          'Role name is required',
        );
      }

      const role = await this.rolesService.create(name, description);
      return ResponseApi.success(
        'Role created successfully',
        role,
        HttpStatus.CREATED,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseApi.error404(error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create role',
      );
    }
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([]))
  async updateRole(
    @Param('id') roleId: number,
    @Body() body: any,
  ): Promise<ICustomResponse<Role>> {
    try {
      const name = body.name;
      const description = body.description;

      if (!name) {
        return ResponseApi.customError(
          HttpStatus.BAD_REQUEST,
          'Role name is required',
        );
      }

      const role = await this.rolesService.update(roleId, name, description);
      return ResponseApi.success('Role updated successfully', role);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseApi.error404(error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update role',
      );
    }
  }

  @Delete(':id')
  async deleteRole(
    @Param('id') roleId: number,
  ): Promise<ICustomResponse<boolean>> {
    try {
      await this.rolesService.delete(roleId);
      return ResponseApi.success('Role deleted successfully', true);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseApi.error404(error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete role',
      );
    }
  }

  @Post('initialize')
  async initializeRoles(): Promise<ICustomResponse<void>> {
    try {
      await this.rolesService.initializeDefaultRoles();
      return ResponseApi.success(
        'Default roles initialized successfully',
        null,
      );
    } catch {
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to initialize roles',
      );
    }
  }

  @Post('assign/:userId')
  @UseInterceptors(FileFieldsInterceptor([]))
  async assignRole(
    @Param('userId') userId: number,
    @Body() body: any,
  ): Promise<ICustomResponse<User>> {
    try {
      const roleName = body.roleName;
      if (!roleName) {
        return ResponseApi.customError(
          HttpStatus.BAD_REQUEST,
          'roleName is required',
        );
      }
      const user = await this.rolesService.assignRoleToUser(userId, roleName);
      return ResponseApi.success('Role assigned successfully', user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseApi.error404(error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to assign role',
      );
    }
  }

  @Post('remove/:userId')
  @UseInterceptors(FileFieldsInterceptor([]))
  async removeRole(
    @Param('userId') userId: number,
    @Body() body: any,
  ): Promise<ICustomResponse<User>> {
    try {
      const roleName = body.roleName;
      if (!roleName) {
        return ResponseApi.customError(
          HttpStatus.BAD_REQUEST,
          'roleName is required',
        );
      }
      const user = await this.rolesService.removeRoleFromUser(userId, roleName);
      return ResponseApi.success('Role removed successfully', user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseApi.error404(error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to remove role',
      );
    }
  }

  @Post('set/:userId')
  @UseInterceptors(FileFieldsInterceptor([]))
  async setRoles(
    @Param('userId') userId: number,
    @Body() body: any,
  ): Promise<ICustomResponse<User>> {
    try {
      const roleNames = body.roleNames
        ? Array.isArray(body.roleNames)
          ? body.roleNames
          : [body.roleNames]
        : [];
      if (!roleNames.length) {
        return ResponseApi.customError(
          HttpStatus.BAD_REQUEST,
          'roleNames is required',
        );
      }
      const user = await this.rolesService.setUserRoles(userId, roleNames);
      return ResponseApi.success('User roles updated successfully', user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseApi.error404(error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to set user roles',
      );
    }
  }

  @Get('check/:userId/:roleName')
  async checkRole(
    @Param('userId') userId: number,
    @Param('roleName') roleName: string,
  ): Promise<ICustomResponse<boolean>> {
    try {
      const hasRole = await this.rolesService.userHasRole(userId, roleName);
      return ResponseApi.success('Role check completed', hasRole);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseApi.error404(error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to check role',
      );
    }
  }
}
