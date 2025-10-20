import { InjectToken } from '@/types/injecorator.js';
import { InjecoratorGuard } from '@/types/middleware.js';
import { expect } from '@/asserts/index.js';
import meta from '@/register/meta.js';
import { Injectable } from '../injectable.js';
import { expectMiddleware } from './expect-middleware.js';

const hooks: (keyof InjecoratorGuard)[] = ['canActivate'];
export function Guard() {
  return function (target: Class, context: ClassDecoratorContext) {
    expect.hasOneHook<InjecoratorGuard>(
      target,
      hooks,
      `Guard class must implement at least one hook: [${hooks.join(', ')}]`
    );
    // Same as Injectable, so it can be registered as a provider
    Injectable()(target, context);
    meta.setGuard(context);
  };
}

/**
 * Similar to Guards in NestJS but with different implementation
 * - Can be used on Controllers and Handlers in Controllers
 * - Guard is designed for http requests/replies, so it will not work on Injectables(Although there will not be any errors)
 */
export function UseGuards(...guards: InjectToken[]) {
  expect(guards.length > 0, '@UseGuards requires at least one guard');
  return function (target: Class | Func, context: ClassDecoratorContext | ClassMethodDecoratorContext) {
    expectMiddleware(guards, target, context);

    meta.setUseGuards(context, guards);
  };
}
