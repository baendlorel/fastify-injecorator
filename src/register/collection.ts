import { ReflectDeep } from 'reflect-deep';
import { Class, Key } from '@/types/primitive.js';
import { ModuleMeta } from '@/types/injecorator.js';

import { sym } from '@/common/index.js';
import { APP_LOGGER, APP_INTERCEPTOR, APP_FILTER, APP_GUARD, APP_PIPE } from '@/common/inject-keys.js';
import { expect } from '@/asserts/index.js';

/**
 * Collection of some global metadata
 */
export namespace collection {
  export const globalModules = new Set<Class>();
  export const globalProviders = new Set<Key>();
  export const globalInterceptors: symbol[] = [];
  export const globalGuards: symbol[] = [];
  export const globalFilters: symbol[] = [];
  export const globalPipes: symbol[] = [];

  /**
   * Add global middleware with specific token.
   * - do nothing if the token does not match
   * @param middleware tokens like `APP_FILTER`...
   * @returns
   */
  export function addGlobalMiddleware(middleware: Key) {
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
        return globalPipes.push(APP_PIPE);
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
  export function addGlobalModule(moduleClass: Class): boolean {
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
  }
}
