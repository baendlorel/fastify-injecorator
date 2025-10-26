import { Key } from '@/types/primitive.js';
import { expectDecoratorContext } from '@/asserts/index.js';
import meta from '@/register/meta.js';

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
    return function (_: unknown, context: DecoratorContext) {
      expectDecoratorContext(context, `Invalid decorator context for custom decorator with key: ${String(key)}`);
      meta.setCustom(context, key, metadata);
    };
  };
}

/**
 * Retrieves custom metadata from a class or execution context
 *
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
export function getCustomMetadata<T = unknown>(key: Key, target: any): T | undefined {
  // If target is ExecutionContext, get metadata from the handler method first, then controller class
  if (target && typeof target.getClass === 'function' && typeof target.getHandler === 'function') {
    const controllerClass = target.getClass();
    const handlerMethod = target.getHandler();

    // Try to get from handler method first (method-level metadata takes precedence)
    const handlerMetadata = meta.getCustomMethod<T>(controllerClass, handlerMethod.name, key);
    if (handlerMetadata !== undefined) {
      return handlerMetadata;
    }

    // Fall back to controller class metadata
    return meta.getCustom<T>(controllerClass, key);
  }

  // If target is a class constructor, get metadata directly
  if (typeof target === 'function') {
    return meta.getCustom<T>(target, key);
  }

  return undefined;
}
