import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy các roles được yêu cầu từ metadata
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // Nếu không có yêu cầu roles, cho phép truy cập
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Lấy user từ request
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    // Kiểm tra user có tồn tại không
    if (!user) {
      return false;
    }

    // Kiểm tra user có roles không
    if (!user.roles || !Array.isArray(user.roles)) {
      return false;
    }

    // Kiểm tra xem user có quyền yêu cầu không
    return requiredRoles.some((role) =>
      user.roles.some((userRole) => userRole.name === role),
    );
  }
}
