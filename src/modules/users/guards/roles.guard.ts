import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    
    if (!user) {
      return false;
    }

     
    if (!user.roles || !Array.isArray(user.roles)) {
      return false;
    }

    
    return requiredRoles.some((role) =>
      user.roles.some((userRole) => userRole.name === role),
    );
  }
}
