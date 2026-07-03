import { Guard } from '@core/decorators/middlewares/guard.js';
import { ExecutionContext } from '@core/common/execution-context.js';
import { InjecoratorGuard } from '@core/types/middleware.js';
import { getCustomMethodMetadata, getCustomClassMetadata } from '@core/decorators/custom.js';
import { jwt } from '@core/index.js';

@Guard()
export class RolesGuard implements InjecoratorGuard {
  canActivate(context: ExecutionContext): boolean {
    // Get roles from method or class metadata
    const methodRoles = getCustomMethodMetadata<string[]>(context, 'roles');
    const classRoles = getCustomClassMetadata<string[]>(context, 'roles');
    const requiredRoles = methodRoles || classRoles;

    if (!requiredRoles?.length) {
      // No roles required, allow access
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest();
    const user = jwt.getUserFromRequest(request);

    if (!user?.role) {
      return false;
    }

    // Check if user has one of the required roles
    return requiredRoles.includes(user.role);
  }
}
