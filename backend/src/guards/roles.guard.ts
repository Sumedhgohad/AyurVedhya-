import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || (!Array.isArray(user.roles) && !user.role)) {
      throw new ForbiddenException('GCP SEPARATION OF DUTIES VIOLATION: Access denied. User role not established.');
    }

    const userRoles: string[] = Array.isArray(user.roles) ? user.roles : [user.role];
    const hasRole = requiredRoles.some((r) => userRoles.includes(r));

    if (!hasRole) {
      throw new ForbiddenException(
        `GCP SEPARATION OF DUTIES VIOLATION: Access restricted to role(s): [${requiredRoles.join(
          ', ',
        )}]. Your active role is '${user.role || userRoles[0]}'.`,
      );
    }

    return true;
  }
}
