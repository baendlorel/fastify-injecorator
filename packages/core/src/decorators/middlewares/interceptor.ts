import type { AnyFunction, Constructor } from '@core/types/primitives.js';
import type { NestifyInterceptor } from '@core/types/middleware.js';
import type { InjectToken } from '@core/types/injection.js';

import { expectHasOneHook, expect } from '@core/asserts/index.js';
import { metaSetInterceptor, metaSetUseInterceptors } from '@core/register/meta.js';
import { Injectable } from '../injectable.js';
import { expectMiddleware } from './expect-middleware.js';

const hooks: (keyof NestifyInterceptor)[] = ['intercept'];
/**
 * Use on services, configurations, etc.
 * - Decorated class must implement `NestifyInterceptor`
 */
export function Interceptor() {
  return function (target: Constructor, context: ClassDecoratorContext) {
    expectHasOneHook<NestifyInterceptor>(
      target,
      hooks,
      `Interceptor class must implement at least one hook: [${hooks.join(', ')}]`,
    );
    // Same as Injectable, so it can be registered as a provider
    Injectable()(target, context);
    metaSetInterceptor(context);
  };
}

/**
 * Similar to Interceptors in NestJS but with different implementation
 * - Can be used on Controllers and Handlers in Controllers
 * - Interceptor is designed for http requests/replies, so it will not work on Injectables(Although there will not be any errors)
 */
export function UseInterceptors(...interceptors: InjectToken[]) {
  expect(interceptors.length > 0, '@UseInterceptors requires at least one interceptor');
  return function (target: Constructor | AnyFunction, context: ClassDecoratorContext | ClassMethodDecoratorContext) {
    expectMiddleware(interceptors, target, context);
    metaSetUseInterceptors(context, interceptors);
  };
}
