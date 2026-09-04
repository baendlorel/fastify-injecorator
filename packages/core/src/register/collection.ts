import { type Constructor, type SSKey } from '@nestify-js/shared';
import type { ModuleMeta } from '@core/types/injecorator.js';
import type { PipeOptions } from '@core/types/middleware.js';

import { ReflectDeep } from 'reflect-deep';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE, APP_LOGGER, sym } from '@nestify-js/shared';

import { expect } from '@core/asserts/index.js';

/**
 * Collection of some global metadata
 */
export namespace collection {
  export const globalModules = new Set<Constructor>();
  export const globalProviders = new Set<SSKey>();
  export const globalInterceptors: SSKey[] = [];
  export const globalGuards: SSKey[] = [];
  export const globalFilters: SSKey[] = [];
  export const globalPipes: PipeOptions[] = [];

  /**
   * Add global middleware with specific token.
   * - do nothing if the token does not match
   * @param middleware tokens like `APP_FILTER`...
   * @returns
   */
  export function addGlobalMiddleware(middleware: SSKey) {
    const name = typeof middleware === 'symbol' ? middleware.description : middleware;
    switch (middleware) {
      case APP_FILTER:
        expect(globalFilters.length === 0, `${name} can only be registered once`);
        return globalFilters.push(APP_FILTER);
      case APP_GUARD:
        expect(globalGuards.length === 0, `${name} can only be registered once`);
        return globalGuards.push(APP_GUARD);
      case APP_INTERCEPTOR:
        expect(globalInterceptors.length === 0, `${name} can only be registered once`);
        return globalInterceptors.push(APP_INTERCEPTOR);
      case APP_PIPE:
        expect(globalPipes.length === 0, `${name} can only be registered once`);
        return globalPipes.push({ pipe: APP_PIPE });
      case APP_LOGGER:
        expect(!globalProviders.has(APP_LOGGER), `${name} can only be registered once`);
        return globalProviders.add(APP_LOGGER);
      default:
        break;
    }
  }

  /**
   * @returns whether this module is already added
   */
  export function addGlobalModule(moduleClass: Constructor): boolean {
    if (globalModules.has(moduleClass)) {
      return false;
    }
    globalModules.add(moduleClass);
    return true;
  }

  export function assembleGlobalProviders() {
    globalModules.forEach((m) => {
      const moduleMetadata = ReflectDeep.get(m, [sym.metadata, sym.root, sym.module]) as ModuleMeta;
      moduleMetadata.exports.forEach((exported) => globalProviders.add(exported.name));
    });
    [...globalFilters, ...globalGuards, ...globalInterceptors].forEach((token) => globalProviders.add(token));

    // Always has the APP_LOGGER
    // Default value is fastifyInstance.log
    globalProviders.add(APP_LOGGER);
  }

  /**
   * When registration is done, clears:
   * - globalProviders
   * - globalModules
   * - metadata(exclude sym.Custom) of injecoratorClasses
   */
  export function clear() {
    globalProviders.clear();
    globalModules.clear();
    globalInterceptors.length = 0;
    globalGuards.length = 0;
    globalFilters.length = 0;
    globalPipes.length = 0;
  }
}
