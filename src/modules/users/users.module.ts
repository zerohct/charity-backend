import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controller/users.controller';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';
import { OAuthAccount } from './entities/oauth-account.entity';
import { Role } from './entities/role.entity';
import { RolesService } from './services/role.service';
import { AdminUsersService } from './services/admin-users.service';
import { RolesGuard } from './guards/roles.guard';
import { RolesController } from './controller/roles.controller';
import { AdminUsersController } from './controller/admin-users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, OAuthAccount, Role])],
  controllers: [UsersController, RolesController, AdminUsersController],
  providers: [UsersService, RolesService, AdminUsersService, RolesGuard],
  exports: [UsersService, RolesService, AdminUsersService],
})
export class UsersModule implements OnModuleInit {
  constructor(private readonly rolesService: RolesService) {}

  async onModuleInit() {
    await this.rolesService.initializeDefaultRoles();
  }
}
