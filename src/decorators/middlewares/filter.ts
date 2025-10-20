import { expect } from '@/asserts/index.js';
import meta from '@/register/meta.js';
import { subclassOf } from '@/common/subclass-of.js';

import { Injectable } from '../injectable.js';
import { expectMiddleware } from './expect-middleware.js';

const hooks: (keyof InjecoratorFilter)[] = ['catch'];

/**
 * Set the exception classes to be caught by this filter.
 * - if no exception classes are provided, it will catch all exceptions
 * @param exceptionClasses Classes of exceptions to be caught by this filter
 */
export function Filter(...exceptionClasses: Class[]) {
  return function (target: Class, context: ClassDecoratorContext) {
    expect.hasOneHook<InjecoratorFilter>(
      target,
      hooks,
      `Filter class must implement at least one hook: [${hooks.join(', ')}]`
    );

    exceptionClasses.forEach((exceptionClass) =>
      expect(
        subclassOf(exceptionClass, Error),
        `Error registered by @Filters must be an Error class or its sub class, got '${exceptionClass.name}'`
      )
    );

    // Same as Injectable, so it can be registered as a provider
    Injectable()(target, context);
    meta.setFilters(context, exceptionClasses);
  };
}

/**
 * Similar to Filters in NestJS but with different implementation
 * - Can be used on Controllers and Handlers in Controllers
 * - Filter is designed for http requests/replies, so it will not work on Injectables(Although there will not be any errors)
 */
export function UseFilters(...filters: InjectToken[]) {
  expect(filters.length > 0, '@UseFilters requires at least one filter');
  return function (
    target: Class | Func,
    context: ClassDecoratorContext | ClassMethodDecoratorContext
  ) {
    expectMiddleware(filters, target, context);

    meta.setUseFilters(context, filters);
  };
}
