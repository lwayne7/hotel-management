import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user?: { role?: UserRole };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果没有设置角色要求，允许访问
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // 检查用户是否具有所需角色
    return requiredRoles.some((role) => user?.role === role);
  }
}
