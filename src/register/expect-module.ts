/* eslint-disable @typescript-eslint/no-explicit-any */
import { inspect } from 'node:util';
import { InjectMetadata, ProviderOptions } from '@/types/injecorator.js';

import { Sym } from '@/common/index.js';
import { RouteConfig } from '@/types/index.js';
import { toModuleClass } from '@/common/utils.js';
import { expect, whether } from '@/asserts/index.js';
import meta from '@/register/meta.js';
import provider from './provider.js';

/**
 * It is impossible to type the expecter as an assert function.
 * So we should do it manually blow the class definition.
 */
class ExpectModule extends Function {
  /**
   * Cache the results
   *
   */
  readonly moduleCache = new Set<any>();
  readonly controllerCache = new Set<any>();
  readonly injectableCache = new Set<any>();

  /**
   *
   * A provider should have
   * - provider: an object of provider metadata
   *   - args: an array of constructor arguments
   * - injections?: a record of class dependencies
   */
  isProvider(target: unknown): asserts target is Class {
    expect.isClass(target, `Target is not a class: ${String(target)}`);

    // Should have args[]
    const providerMetadata = meta.getProvider(target);
    expect.isObject(providerMetadata, `class '${target.name}' is not a provider`);
    expect.isArray(providerMetadata.args);

    // If have injections
    const inject = meta.getInject(target);
    if (inject) {
      const notRecordMsg = `class '${target.name}': Inject metadata should be a record of class dependencies`;
      expect.isObject(inject, notRecordMsg);
      expect.record<InjectMetadata>(
        inject,
        (value) => {
          expect.isObject(value, notRecordMsg);
          expect.isInjectArg(value.dependency);
        },
        notRecordMsg
      );
    }
  }

  /**
   * An injectable should have
   * - same feature as a provider
   * - no features from a controller
   */
  isInjectable(target: unknown) {
    if (this.injectableCache.has(target)) {
      return;
    }
    this.isProvider(target);

    // Should not be a controller
    const controlled = meta.getController(target);
    expect.isUndefined(controlled, `@Injectable should not be a controller`);

    this.injectableCache.add(target);
  }

  /**
   * A controller should have
   * - same feature as provider
   * - injections?: a record of class dependencies
   * - prefix[]: an array of path prefix
   * - controlled: an object of controller metadata
   * - routes: a record of route metadata
   *   - field: a string/symbol of the method name
   *   - method: a string of HTTP method
   *   - route: an array of path nodes
   *   - opts?: an object of route options
   */
  isController(target: unknown) {
    if (this.controllerCache.has(target)) {
      return;
    }

    this.isProvider(target);

    // controller metadata check
    const pred = (pathNode: string) => {
      if (!whether.isPathNode(pathNode)) {
        return `Path node must match /^[a-zA-Z0-9_-]+$/. But got: [${pathNode}]`;
      }
      return true;
    };

    const controlled = meta.getController(target);
    expect.isObject(controlled, `class '${target.name}': is not a controller`);
    expect.isArray(controlled.prefix, pred, `class '${target.name}': prefix should be a string array`);

    const routes = meta.getRoute(target);
    expect.isObject(routes, `${target.name}: should have routes`);
    expect.record<RouteConfig>(
      routes,
      (v: RouteConfig) => {
        const basic = v[Sym.RouteBasic];
        expect.isKey(basic.field, `${target.name}: field of this route config should be a string/symbol`);
        expect.isArray(basic.route, pred, 'Route should be a string array');
        expect.orObject(v[Sym.RouteOpt], `${target.name}: opts should be an object`);
      },
      `${target.name}: should have a record of route metadata`
    );

    expect.isArray(controlled.prefix, (p, i) => {
      if (typeof p !== 'string') {
        return `Prefix should be string[], but the ${i}th element got ${typeof p}`;
      }
      return true;
    });

    this.controllerCache.add(target);
  }

  /**
   * Check **Everything** recursively
   * @param target
   * @returns
   */
  isModule(target: unknown): asserts target is Class {
    if (this.moduleCache.has(target)) {
      return;
    }

    expect.isClass(target, `Should be a module class, got: ${inspect(target)}`);
    const moduleMetadata = meta.getModule(target);

    expect.isString(moduleMetadata.prefix, 'Module metadata.prefix should be a string');
    expect.isBoolean(moduleMetadata.outer, 'Module metadata.outer should be a boolean');

    expect.isObject(moduleMetadata, 'Module metadata should be an object');
    if (moduleMetadata.controllers) {
      expect.isArray(moduleMetadata.controllers);
      moduleMetadata.controllers.forEach((t) => this.isController(t));
    }
    if (moduleMetadata.providers) {
      expect.isArray(moduleMetadata.providers);
      moduleMetadata.providers.forEach((t) => expect.isProviderOptions(t));
    }
    if (moduleMetadata.exports) {
      // & exports must be a subarray of providers
      expect.isArray(moduleMetadata.exports, (exported) => expect.includes(moduleMetadata.providers, exported));
      moduleMetadata.exports.forEach((t) => this.isInjectable(t));
    }
    if (moduleMetadata.imports) {
      expect.isArray(moduleMetadata.imports);
      moduleMetadata.imports.forEach((m) => {
        const moduleClass = toModuleClass(m);
        this.isModule(moduleClass);
      });
    }
    this.moduleCache.add(target);
  }

  private getDependencyTokens(providerOptions: ProviderOptions): Key[] | null {
    if (whether.isClass(providerOptions)) {
      const injections = meta.getInject(providerOptions);
      if (!whether.isObject(injections)) {
        return null;
      }
      return Object.values(injections).map((injection) => provider.getInjectToken(injection.dependency));
    }

    if ('useClass' in providerOptions) {
      const injections = meta.getInject(providerOptions.useClass);
      if (!whether.isObject(injections)) {
        return null;
      }
      return Object.values(injections).map((injection) => provider.getInjectToken(injection.dependency));
    }

    if ('inject' in providerOptions) {
      if (Array.isArray(providerOptions.inject)) {
        providerOptions.inject.map((arg) => (whether.isKey(arg) ? arg : arg.name));
      } else {
        return null;
      }
    }

    return null;
  }

  /**
   * @param opts Will only check when it is a class
   * @param accessibleProviderTokens injections must be accessible
   */
  accessibleProviders(opts: ProviderOptions, accessibleProviderTokens: Key[]) {
    const tokens = this.getDependencyTokens(opts);
    if (!tokens) {
      return;
    }

    const providerName = String(provider.getToken(opts));
    for (let i = 0; i < tokens.length; i++) {
      const tokenStr = String(tokens[i]);
      expect.includes(
        accessibleProviderTokens,
        tokens[i],
        `Class '${providerName}' can only inject providers from its module, imported modules or global modules, but '${tokenStr}' is not found in the accessible providers.`
      );
    }
  }

  /**
   * When registration is done, clears:
   * - moduleCache
   * - controllerCache
   * - injectableCache
   */
  clear() {
    this.moduleCache.clear();
    this.controllerCache.clear();
    this.injectableCache.clear();
  }
}

const expectModule: ExpectModule = new ExpectModule();
export default expectModule;
