import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (request.query && request.query.token) {
      token = request.query.token as string;
    }

    if (!token) {
      throw new UnauthorizedException('SECURITY ALERT: Missing or invalid Authorization Bearer token.');
    }
    let decoded: any = {};

    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) throw new Error();
      decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
    } catch {
      throw new UnauthorizedException('SECURITY ALERT: Malformed or unparseable JWT token.');
    }

    // Extract roles from all possible standard formats
    const extractedRoles: string[] = [
      ...(decoded.realm_access?.roles || []),
      ...(decoded.roles || []),
      ...(decoded.role ? [decoded.role] : []),
    ];

    // Fallback: If email has role identity in dev
    if (extractedRoles.length === 0 && decoded.email) {
      if (decoded.email.includes('compliance')) extractedRoles.push('ROLE_COMPLIANCE_OFFICER');
      if (decoded.email.includes('investigator')) extractedRoles.push('ROLE_INVESTIGATOR');
      if (decoded.email.includes('director')) extractedRoles.push('ROLE_LEADERSHIP');
    }

    request.user = {
      email: decoded.email || decoded.preferred_username,
      roles: extractedRoles,
    };

    // If endpoint has NO @Roles(...) requirement, allow all authenticated users
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user has at least one required role
    const hasRole = requiredRoles.some((role) => extractedRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `GCP SEPARATION OF DUTIES VIOLATION: Access denied. Required role: [${requiredRoles.join(', ')}]. Your roles: [${extractedRoles.join(', ')}].`
      );
    }

    return true;
  }
}
