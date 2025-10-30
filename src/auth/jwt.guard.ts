import { Guard } from '@/decorators/middlewares/guard.js';
import { ExecutionContext } from '@/common/execution-context.js';
import { InjecoratorGuard } from '@/types/middleware.js';
import { JwtService } from './jwt.js';

/**
 * JWT Guard - protects routes by validating JWT tokens
 * - Extracts token from Authorization header (Bearer token)
 * - Validates token using JwtService
 * - Attaches decoded payload to request[sym.user]
 *
 * Usage:
 * ```typescript
 * @Controller('protected')
 * @UseGuards(JwtGuard)
 * class ProtectedController {
 *   @Get('profile')
 *   getProfile(@Req() request: FastifyRequest) {
 *     return request.user; // decoded JWT payload
 *   }
 * }
 * ```
 */
export function JwtGuard(jwt = JwtService.default) {
  @Guard()
  class JwtGuardClass implements InjecoratorGuard {
    canActivate(context: ExecutionContext): boolean {
      const http = context.switchToHttp();
      const request = http.getRequest();

      // Extract token from Authorization header
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        throw new Error('No token provided');
      }

      try {
        // Verify token and attach payload to request
        const payload = jwt.verify(token);

        // Attach user to request object
        JwtService.setUserToRequest(request, payload);

        return true;
      } catch (error) {
        throw new Error(`Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    /**
     * Extract JWT token from Authorization header
     * - Expected format: "Bearer <token>"
     */
    private extractTokenFromHeader(request: any): string | null {
      const authorization = request.headers?.authorization;

      if (!authorization) {
        return null;
      }

      const [type, token] = authorization.split(' ');

      return type === 'Bearer' ? token : null;
    }
  }
  return JwtGuardClass;
}
