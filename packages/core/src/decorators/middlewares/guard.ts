import type { AnyFunction, Constructor } from '@core/types/primitives.js';
import type { InjectToken } from '@core/types/injecorator.js';
import type { InjecoratorGuard } from '@core/types/middleware.js';
import { sym } from '@nestify-js/shared';

import { expectHasOneHook, expect } from '@core/asserts/index.js';
import { metaSetGuard, metaSetProvider, metaSetUseGuards } from '@core/register/meta.js';
import { Injectable } from '../injectable.js';
import { expectMiddleware } from './expect-middleware.js';

const hooks: (keyof InjecoratorGuard)[] = ['canActivate'];
/**
 * Use to define a Guard class
 */
export function Guard() {
  return function (target: Constructor, context: ClassDecoratorContext) {
    expectHasOneHook<InjecoratorGuard>(
      target,
      hooks,
      `Guard class must implement at least one hook: [${hooks.join(', ')}]`,
    );
    // Same as Injectable, so it can be registered as a provider
    Injectable()(target, context);
    metaSetGuard(context);
  };
}

export function _GuardSet(cls: Constructor) {
  const metadata = {};
  (cls as any)[sym.metadata] = metadata;
  const context = { kind: 'class' as const, name: cls.name, metadata, addInitializer: () => {} };
  metaSetProvider(context);
  metaSetGuard(context);
}

/**
 * Similar to Guards in NestJS but with different implementation
 * - Can be used on Controllers and Handlers in Controllers
 * - Guard is designed for http requests/replies, so it will not work on Injectables(Although there will not be any errors)
 */
export function UseGuards(...guards: InjectToken[]) {
  expect(guards.length > 0, '@UseGuards requires at least one guard');
  return function (target: Constructor | AnyFunction, context: ClassDecoratorContext | ClassMethodDecoratorContext) {
    expectMiddleware(guards, target, context);

    metaSetUseGuards(context, guards);
  };
}
