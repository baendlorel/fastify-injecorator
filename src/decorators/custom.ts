import { Class, Func, Key } from '@/types/primitive.js';
import { ExecutionContext } from '@/common/execution-context.class.js';

import { expectDecoratorContext, expectFunction, isClass, isFunction, throws } from '@/asserts/index.js';
import meta from '@/register/meta.js';
import { sym } from '@/common/sym.js';

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
    return function (target: Class | Func | undefined, context: DecoratorContext) {
      expectDecoratorContext(context, `__func__ Invalid decorator context, got ${typeof context}`);
      if (isClass(target)) {
        return meta.set<T>(context, [key], metadata);
      } else if (isFunction(target)) {
        return meta.set<T>(context, [sym.custom.method, target.name, key], metadata);
      } else if (target === undefined) {
        return meta.set<T>(context, [sym.custom.field, context.name as Key, key], metadata);
      }
    };
  };
}

/**
 * Retrieves custom metadata from a class or execution context
 *
 * @param target Class\Method\FieldName
 * @param key - The key used when creating the custom decorator
 * @param target - Either a class constructor or ExecutionContext
 * @returns The stored metadata or undefined if not found
 *
 * @example
 * ```typescript
 * // In a guard, interceptor, pipe, or filter
 * @Guard()
 * class MyGuard implements InjecoratorGuard {
 *   canActivate(context: ExecutionContext): boolean {
 *     // Get metadata from the controller class
 *     const controllerRoles = getCustomMetadata<string[]>('roles', context.getClass());
 *
 *     // Get metadata from the handler method via execution context
 *     const handlerRoles = getCustomMetadata<string[]>('roles', context);
 *
 *     return checkPermissions(controllerRoles, handlerRoles);
 *   }
 * }
 * ```
 */
export function getCustomMetadata<T = unknown>(
  target: Class | Func | Key,
  key: Key,
  context: ExecutionContext
): T | undefined {
  // If target is ExecutionContext, get metadata from the handler method first, then controller class
  expectFunction(context?.getClass, '__func__ Invalid target for getCustomMetadata');
  const controllerClass = context.getClass();

  if (isClass(target)) {
    return meta.get<T>(controllerClass, [key]);
  } else if (isFunction(target)) {
    return meta.get<T>(controllerClass, [sym.custom.method, target.name, key]);
  } else if (target === undefined) {
    return meta.get<T>(controllerClass, [sym.custom.field, target, key]);
  }

  throws(`__func__ Invalid target for getCustomMetadata, got ${typeof target}`);
}
