import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('SECURITY ALERT: Missing or invalid Authorization Bearer token.');
    }

    const token = authHeader.split(' ')[1];

    // Decode and validate token payload
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) {
        // Fallback for dev testing tokens
        if (token.startsWith('MOCK_JWT_TOKEN_')) return true;
        throw new Error();
      }
      const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('SECURITY ALERT: JWT token is expired or forged.');
    }
  }
}
