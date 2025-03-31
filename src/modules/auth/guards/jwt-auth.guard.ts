// jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Get the request object
    const request = context.switchToHttp().getRequest();

    // Define public routes that don't need authentication
    const publicRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/verify',
      '/auth/resend-verification',
    ];

    // Check if the route is public
    if (publicRoutes.some((route) => request.url.includes(route))) {
      return true;
    }

    // Check for metadata indicating the route is public
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    // Apply JWT authentication for protected routes
    return super.canActivate(context);
  }
}
