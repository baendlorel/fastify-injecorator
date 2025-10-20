import { ReflectDeep } from 'reflect-deep';
import { Sym } from '@/common/index.js';
import {
  APP_LOGGER,
  APP_INTERCEPTOR,
  APP_FILTER,
  APP_GUARD,
  APP_PIPE,
} from '@/common/inject-keys.js';
import { expect } from '@/asserts/index.js';

/**
 * Collection of some global metadata
 */
class Collection {
  readonly globalModules = new Set<Class>();
  readonly globalProviders = new Set<Key>();
  readonly globalInterceptors: symbol[] = [];
  readonly globalGuards: symbol[] = [];
  readonly globalFilters: symbol[] = [];
  readonly globalPipes: symbol[] = [];

  /**
   * Add global middleware with specific token.
   * - do nothing if the token does not match
   * @param middleware tokens like `APP_FILTER`...
   * @returns
   */
  addGlobalMiddleware(middleware: Key) {
    const name = typeof middleware === 'symbol' ? middleware.description : middleware;
    switch (middleware) {
      case APP_FILTER:
        expect(this.globalFilters.length === 0, `${name} can only be registered once`);
        return this.globalFilters.push(APP_FILTER);
      case APP_GUARD:
        expect(this.globalGuards.length === 0, `${name} can only be registered once`);
        return this.globalGuards.push(APP_GUARD);
      case APP_INTERCEPTOR:
        expect(this.globalInterceptors.length === 0, `${name} can only be registered once`);
        return this.globalInterceptors.push(APP_INTERCEPTOR);
      case APP_PIPE:
        expect(this.globalPipes.length === 0, `${name} can only be registered once`);
        return this.globalPipes.push(APP_PIPE);
      case APP_LOGGER:
        expect(!this.globalProviders.has(APP_LOGGER), `${name} can only be registered once`);
        return this.globalProviders.add(APP_LOGGER);
      default:
        break;
    }
  }

  /**
   * @returns whether this module is already added
   */
  addGlobalModule(moduleClass: Class): boolean {
    if (this.globalModules.has(moduleClass)) {
      return false;
    }
    this.globalModules.add(moduleClass);
    return true;
  }

  assembleGlobalProviders() {
    this.globalModules.forEach((m) => {
      const moduleMetadata = ReflectDeep.get(m, [
        Sym.metadata,
        Sym.Root,
        Sym.Module,
      ]) as ModuleMetadata;
      moduleMetadata.exports.forEach((exported) => this.globalProviders.add(exported.name));
    });
    [...this.globalFilters, ...this.globalGuards, ...this.globalInterceptors].forEach((token) =>
      this.globalProviders.add(token)
    );

    // Always has the APP_LOGGER
    // Default value is fastifyInstance.log
    this.globalProviders.add(APP_LOGGER);
  }

  /**
   * When registration is done, clears:
   * - globalProviders
   * - globalModules
   * - metadata(exclude Sym.Custom) of injecoratorClasses
   */
  clear() {
    this.globalProviders.clear();
    this.globalModules.clear();
  }
}

const collection = new Collection();
export default collection;
