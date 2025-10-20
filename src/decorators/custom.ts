import { expect } from '@/asserts/index.js';
import meta from '@/register/meta.js';

/**
 * This decorator is meant to be used on fields, methods and classes
 * - Merges with other same decorators by `Object.assign`
 * @param key
 * @param meta
 */
export function SetMetadata<T = unknown>(key: Key, metadata: T) {
  return function (_: unknown, context: DecoratorContext) {
    expect.isDecoratorContext(context);
    meta.setCustom(context, key, metadata);
  };
}

// todo [装饰器] 制作一个装饰器工厂，让用户可以自定义装饰器，并使用metadata的内容
