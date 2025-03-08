import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../services/role.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Nếu không có user và không yêu cầu 'guest', cấm
    if (!user && !requiredRoles.includes('guest')) {
      throw new ForbiddenException('Authentication required');
    }

    // Nếu không có user nhưng cho phép 'guest' => return true
    if (!user && requiredRoles.includes('guest')) {
      return true;
    }

    // Kiểm tra user có ít nhất 1 trong các roles yêu cầu không
    for (const role of requiredRoles) {
      const hasRole = await this.rolesService.userHasRole(user.id, role);
      if (hasRole) {
        return true;
      }
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
