import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { AdminUsersService } from '../services/admin-users.service';
import { RequireRoles } from '../decorators/require-roles.decorator';

@Controller('admin/users')
@RequireRoles('admin')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async getAllUsers() {
    return this.adminUsersService.getAllUsersWithRoles();
  }

  @Post()
  async createUser(@Body() createDto: { user: any; roles: string[] }) {
    return this.adminUsersService.createUserWithRoles(
      createDto.user,
      createDto.roles,
    );
  }

  @Put(':id/roles')
  async updateUserRoles(
    @Param('id') userId: number,
    @Body() { roles }: { roles: string[] },
  ) {
    return this.adminUsersService.updateUserRoles(userId, roles);
  }
}
