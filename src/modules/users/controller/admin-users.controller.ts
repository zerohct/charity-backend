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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator';
import { UploadedFiles } from '@nestjs/common/decorators/http/route-params.decorator';

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
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }]),
  )
  async createUser(
    @Body() body: any,
    @UploadedFiles() files: { profileImage?: Express.Multer.File[] },
  ): Promise<ICustomResponse<User>> {
    try {
      const { email, password, firstName, lastName, username, phone, roles } =
        body;

      const profileImage = files?.profileImage?.[0]?.path ?? undefined;

      const userDto: CreateUserDto = {
        email,
        password,
        firstName,
        lastName,
        username,
        phone,
      };

      let roleNames: string[] = [];
      if (Array.isArray(roles)) {
        roleNames = roles;
      } else if (typeof roles === 'string') {
        try {
          const parsed = JSON.parse(roles);
          roleNames = Array.isArray(parsed) ? parsed : [roles];
        } catch {
          roleNames = [roles];
        }
      }

      const createdUser =
        await this.adminUsersService.createUserWithRolesAndImage(
          userDto,
          roleNames,
          profileImage,
        );

      return ResponseApi.success(
        'User created successfully',
        createdUser,
        HttpStatus.CREATED,
      );
    } catch (error) {
      console.error('[CreateUserError]', error);
      if (error instanceof UnauthorizedException) {
        return ResponseApi.customError(HttpStatus.UNAUTHORIZED, error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create user',
      );
    }
  }

  // @Put(':id')
  // @UseInterceptors(
  //   FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }]),
  // )
  // async updateUser(
  //   @Param('id') userId: number,
  //   @Body() body: any,
  //   @UploadedFiles() files: { profileImage?: Express.Multer.File[] },
  // ): Promise<ICustomResponse<User>> {
  //   try {
  //     const profileImage = files?.profileImage?.[0]?.path || null;
  //     const updateDto: any = {
  //       ...body,
  //       avatar: profileImage ?? undefined,
  //     };

  //     const user = await this.adminUsersService.updateUser(userId, updateDto);
  //     return ResponseApi.success('User updated successfully', user);
  //   } catch (error) {
  //     return error instanceof NotFoundException
  //       ? ResponseApi.error404(error.message)
  //       : ResponseApi.customError(
  //           HttpStatus.INTERNAL_SERVER_ERROR,
  //           'Failed to update user',
  //         );
  //   }
  // }

  // @Put(':id')
  // @UseInterceptors(FileFieldsInterceptor([]))
  // async updateUserRoles(
  //   @Param('id') userId: number,
  //   @Body() body: any,
  // ): Promise<ICustomResponse<User>> {
  //   try {
  //     const roles = body.roles
  //       ? Array.isArray(body.roles)
  //         ? body.roles
  //         : [body.roles]
  //       : [];

  //     const user = await this.adminUsersService.updateUserRoles(userId, roles);
  //     return ResponseApi.success('User roles updated successfully', user);
  //   } catch (error) {
  //     return error instanceof NotFoundException
  //       ? ResponseApi.error404(error.message)
  //       : ResponseApi.customError(
  //           HttpStatus.INTERNAL_SERVER_ERROR,
  //           'Failed to update user roles',
  //         );
  //   }
  // }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }]),
  )
  async updateUser(
    @Param('id') userId: number,
    @Body() body: any,
    @UploadedFiles() files: { profileImage?: Express.Multer.File[] },
  ): Promise<ICustomResponse<User>> {
    try {
      const userData = body.user || body;
      const { email, password, firstName, lastName, username, phone } =
        userData;
      const roles = body.roles || userData.roles;

      const profileImage = files?.profileImage?.[0]?.path ?? undefined;

      // Chuẩn bị dữ liệu cập nhật
      const updateDto: any = {
        email,
        password,
        firstName: firstName || null,
        lastName: lastName || null,
        username,
        phone,
        avatar: profileImage ?? undefined,
      };

      // Xóa các trường undefined để không ghi đè dữ liệu cũ không cần thiết
      Object.keys(updateDto).forEach(
        (key) => updateDto[key] === undefined && delete updateDto[key],
      );

      // Cập nhật thông tin user
      const updatedUser = await this.adminUsersService.updateUser(
        userId,
        updateDto,
      );

      // Nếu có roles, cập nhật roles
      if (roles) {
        let roleNames: string[] = [];
        if (Array.isArray(roles)) {
          roleNames = roles;
        } else if (typeof roles === 'string') {
          try {
            const parsed = JSON.parse(roles);
            roleNames = Array.isArray(parsed) ? parsed : [roles];
          } catch {
            roleNames = [roles];
          }
        }
        await this.adminUsersService.updateUserRoles(userId, roleNames);
      }

      // Lấy lại thông tin user sau khi cập nhật
      const finalUser = await this.adminUsersService.getUserById(userId);
      return ResponseApi.success('User updated successfully', finalUser);
    } catch (error) {
      console.error('[UpdateUserError]', error);
      if (error instanceof NotFoundException) {
        return ResponseApi.error404(error.message);
      }
      if (error instanceof UnauthorizedException) {
        return ResponseApi.customError(HttpStatus.UNAUTHORIZED, error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update user',
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

  @Get(':id')
  async getUserById(
    @Param('id') userId: number,
  ): Promise<ICustomResponse<User>> {
    try {
      const user = await this.adminUsersService.getUserById(userId);
      return ResponseApi.success('User retrieved successfully', user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseApi.error404(error.message);
      }
      return ResponseApi.customError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve user',
      );
    }
  }
}
