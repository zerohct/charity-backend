import { Controller, Get, Post, Body } from '@nestjs/common';
import { RolesService } from '../services/role.service';
import { RequireRoles } from '../decorators/require-roles.decorator';

@Controller('admin/roles')
@RequireRoles('admin')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getAllRoles() {
    return this.rolesService.findAll();
  }

  @Post()
  async createRole(
    @Body() createRoleDto: { name: string; description?: string },
  ) {
    return this.rolesService.create(
      createRoleDto.name,
      createRoleDto.description,
    );
  }

  @Post('initialize')
  async initializeRoles() {
    await this.rolesService.initializeDefaultRoles();
    return { message: 'Default roles initialized successfully' };
  }
}
