import type { Class, Func, Key } from '@nestify/shared';
import { sym } from '@nestify/shared';
import { expectDecoratorContext } from '@core/asserts/index.js';
import { metaGet, metaSet } from '@core/register/meta.js';
import { ExecutionContext } from '@core/common/execution-context.js';

/**
 * Creates a custom decorator factory that stores metadata in the [sym.root, sym.custom] path
 * This metadata can be accessed in custom guards, interceptors, pipes, and filters
 *
 * @param key - The key to store the metadata under
 * @returns A decorator factory function that accepts metadata and returns a decorator
 *
 * @example
 * ```typescript
 * // Create a custom decorator
 * const Roles = createCustomDecorator<string[]>('roles');
 *
 * // Use it to decorate classes, methods, or fields
 * @Controller()
 * @Roles(['admin', 'user'])
 * class UserController {
 *   @Get('/sensitive')
 *   @Roles(['admin'])
 *   getSensitiveData() {
 *     return { data: 'sensitive' };
 *   }
 * }
 *
 * // Access in a guard
 * @Guard()
 * class RoleGuard implements InjecoratorGuard {
 *   canActivate(context: ExecutionContext): boolean {
 *     const requiredRoles = getCustomMetadata<string[]>('roles', context);
 *     // Check if user has required roles
 *     return checkUserRoles(requiredRoles);
 *   }
 * }
 * ```
 */
export function createCustomDecorator<T = unknown>(key: Key) {
  return function (metadata: T) {
    return function (target: Class | Func, context: DecoratorContext) {
      expectDecoratorContext(context, `__func__ Invalid decorator context, got ${typeof context}`);

      if (context.kind === 'class') {
        metaSet<T>(context, [sym.custom.root, key], metadata);
      } else if (context.kind === 'method') {
        metaSet<T>(context, [sym.custom.root, sym.custom.method, context.name, key], metadata);
      } else {
        _throw(
          `Invalid decorator context for custom decorator with key "${String(key)}", must be class or method, got: ${context.kind}`,
        );
      }
    };
  };
}

/**
 * Retrieves custom metadata
 *
 * @example
 * ```typescript
 * // In a guard, interceptor, pipe, or filter
 * @Guard()
 * class MyGuard implements InjecoratorGuard {
 *   canActivate(context: ExecutionContext): boolean {
 *     // Get metadata from the controller class
 *     const controllerRoles = getCustomClassMetadata<string[]>(context, 'roles');
 *
 *     // Get metadata from the handler method via execution context
 *     const handlerRoles = getCustomMethodMetadata<string[]>(context, 'roles');
 *
 *     return checkPermissions(controllerRoles, handlerRoles);
 *   }
 * }
 * ```
 */
export function getCustomClassMetadata<T = unknown>(context: ExecutionContext, key: Key): T | undefined {
  return metaGet<T>(context.getClass(), [sym.custom.root, key]);
}

/**
 * Retrieves custom metadata
 *
 * @example
 * ```typescript
 * // In a guard, interceptor, pipe, or filter
 * @Guard()
 * class MyGuard implements InjecoratorGuard {
 *   canActivate(context: ExecutionContext): boolean {
 *     // Get metadata from the controller class
 *     const controllerRoles = getCustomClassMetadata<string[]>(context, 'roles');
 *
 *     // Get metadata from the handler method via execution context
 *     const handlerRoles = getCustomMethodMetadata<string[]>(context, 'roles');
 *
 *     return checkPermissions(controllerRoles, handlerRoles);
 *   }
 * }
 * ```
 */
export function getCustomMethodMetadata<T = unknown>(context: ExecutionContext, key: Key): T | undefined {
  return metaGet<T>(context.getClass(), [sym.custom.root, sym.custom.method, context.getHandler().name, key]);
}
