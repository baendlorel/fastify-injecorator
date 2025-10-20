import { expect } from '@/asserts/index.js';
import meta from '@/register/meta.js';
import { Injectable } from '../injectable.js';
import { expectMiddleware } from './expect-middleware.js';

const hooks: (keyof InjecoratorInterceptor)[] = ['intercept'];
/**
 * Use on services, configurations, etc.
 */
export function Interceptor() {
  return function (target: Class, context: ClassDecoratorContext) {
    expect.hasOneHook<InjecoratorInterceptor>(
      target,
      hooks,
      `Interceptor class must implement at least one hook: [${hooks.join(', ')}]`
    );
    // Same as Injectable, so it can be registered as a provider
    Injectable()(target, context);
    meta.setInterceptor(context);
  };
}

/**
 * Similar to Interceptors in NestJS but with different implementation
 * - Can be used on Controllers and Handlers in Controllers
 * - Interceptor is designed for http requests/replies, so it will not work on Injectables(Although there will not be any errors)
 */
export function UseInterceptors(...interceptors: InjectToken[]) {
  expect(interceptors.length > 0, '@UseInterceptors requires at least one interceptor');
  return function (
    target: Class | Func,
    context: ClassDecoratorContext | ClassMethodDecoratorContext
  ) {
    expectMiddleware(interceptors, target, context);
    meta.setUseInterceptors(context, interceptors);
  };
}
