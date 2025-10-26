/* eslint-disable @typescript-eslint/no-explicit-any */
import { inspect } from 'node:util';
import { InjectMetadata, ProviderOptions } from '@/types/injecorator.js';

import { Sym } from '@/common/index.js';
import { RouteConfig } from '@/types/index.js';
import { toModuleClass } from '@/common/utils.js';
import {
  eincludes,
  eisArray,
  eisBoolean,
  eisClass,
  eisInjectArg,
  eisKey,
  eisObject,
  eisProviderOptions,
  eisRecord,
  eisString,
  eisUndefined,
  eorObject,
  wisClass,
  wisKey,
  wisObject,
  wisPathNode,
} from '@/asserts/index.js';
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
    eisClass(target, `Target is not a class: ${String(target)}`);

    // Should have args[]
    const providerMetadata = meta.getProvider(target);
    eisObject(providerMetadata, `class '${target.name}' is not a provider`);
    eisArray(providerMetadata.args, 'provider metadata.args should be an array');

    // If have injections
    const inject = meta.getInject(target);
    if (inject) {
      const msg = `class '${target.name}': Inject metadata should be a record of class dependencies`;
      eisObject(inject, msg);
      eisRecord<InjectMetadata>(inject, (value) => (eisObject(value, msg), eisInjectArg(value.dependency)), msg);
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
    eisUndefined(controlled, `@Injectable should not be a controller`);

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
      if (!wisPathNode(pathNode)) {
        return `Path node must match /^[a-zA-Z0-9_-]+$/. But got: [${pathNode}]`;
      }
      return true;
    };

    const controlled = meta.getController(target);
    eisObject(controlled, `class '${target.name}': is not a controller`);
    eisArray(controlled.prefix, `class '${target.name}': prefix should be a string array`, pred);

    const routes = meta.getRoute(target);
    eisObject(routes, `${target.name}: should have routes`);
    eisRecord<RouteConfig>(
      routes,
      (v: RouteConfig) => {
        const basic = v[Sym.RouteBasic];
        eisKey(basic.field, `${target.name}: field of this route config should be a string/symbol`);
        eisArray(basic.route, 'Route should be a string array', pred);
        eorObject(v[Sym.RouteOpt], `${target.name}: opts should be an object`);
      },
      `${target.name}: should have a record of route metadata`
    );

    eisArray(controlled.prefix, 'controller prefix must be a string', (p, i) => {
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

    eisClass(target, `Should be a module class, got: ${inspect(target)}`);
    const mm = meta.getModule(target);

    eisString(mm.prefix, 'Module metadata.prefix should be a string');
    eisBoolean(mm.outer, 'Module metadata.outer should be a boolean');

    eisObject(mm, 'Module metadata should be an object');
    if (mm.controllers) {
      eisArray(mm.controllers, 'controllers must be an array');
      mm.controllers.forEach((t) => this.isController(t));
    }
    if (mm.providers) {
      eisArray(mm.providers, 'providers must be an array');
      mm.providers.forEach((t) => eisProviderOptions(t));
    }
    if (mm.exports) {
      // & exports must be a subarray of providers
      eisArray(mm.exports, 'exports must be an array', (exported) => eincludes(mm.providers, exported));
      mm.exports.forEach((t) => this.isInjectable(t));
    }
    if (mm.imports) {
      eisArray(mm.imports, 'imports must be an array');
      mm.imports.forEach((m) => {
        const moduleClass = toModuleClass(m);
        this.isModule(moduleClass);
      });
    }
    this.moduleCache.add(target);
  }

  private getDependencyTokens(providerOptions: ProviderOptions): Key[] | null {
    if (wisClass(providerOptions)) {
      const injections = meta.getInject(providerOptions);
      if (!wisObject(injections)) {
        return null;
      }
      return Object.values(injections).map((injection) => provider.getInjectToken(injection.dependency));
    }

    if ('useClass' in providerOptions) {
      const injections = meta.getInject(providerOptions.useClass);
      if (!wisObject(injections)) {
        return null;
      }
      return Object.values(injections).map((injection) => provider.getInjectToken(injection.dependency));
    }

    if ('inject' in providerOptions) {
      if (Array.isArray(providerOptions.inject)) {
        providerOptions.inject.map((arg) => (wisKey(arg) ? arg : arg.name));
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
      eincludes(
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
