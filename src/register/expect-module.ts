/* eslint-disable @typescript-eslint/no-explicit-any */
import { inspect } from 'node:util';
import { InjectMetadata, ProviderOptions } from '@/types/injecorator.js';

import { Sym } from '@/common/index.js';
import { RouteConfig } from '@/types/index.js';
import { toModuleClass } from '@/common/utils.js';
import {
  eisArray,
  eisBoolean,
  eisClass,
  eisInjectArg,
  eisKey,
  eisObject,
  eisProviderOptions,
  eisRecord,
  eisString,
  eorObject,
  expect,
  wisClass,
  wisKey,
  wisObject,
  wisPathNode,
} from '@/asserts/index.js';
import meta from '@/register/meta.js';
import ph from './provider.js';

const moduleCache = new Set<any>();
const controllerCache = new Set<any>();
const injectableCache = new Set<any>();

/**
 *
 * A provider should have
 * - provider: an object of provider metadata
 *   - args: an array of constructor arguments
 * - injections?: a record of class dependencies
 */
export function eisProvider(target: unknown): asserts target is Class {
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
export function eisInjectable(target: unknown) {
  if (injectableCache.has(target)) {
    return;
  }
  eisProvider(target);

  // Should not be a controller
  expect(meta.getController(target) === undefined, `@Injectable should not be a controller`);

  injectableCache.add(target);
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
export function eisController(target: unknown) {
  if (controllerCache.has(target)) {
    return;
  }

  eisProvider(target);

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

  controllerCache.add(target);
}

/**
 * Check **Everything** recursively
 * @param target
 * @returns
 */
export function eisModule(target: unknown): asserts target is Class {
  if (moduleCache.has(target)) {
    return;
  }

  eisClass(target, `Should be a module class, got: ${inspect(target)}`);
  const mm = meta.getModule(target);

  eisString(mm.prefix, 'Module metadata.prefix should be a string');
  eisBoolean(mm.outer, 'Module metadata.outer should be a boolean');

  eisObject(mm, 'Module metadata should be an object');
  if (mm.controllers) {
    eisArray(mm.controllers, 'controllers must be an array');
    mm.controllers.forEach((t) => eisController(t));
  }
  if (mm.providers) {
    eisArray(mm.providers, 'providers must be an array');
    mm.providers.forEach((t) => eisProviderOptions(t));
  }
  if (mm.exports) {
    // & exports must be a subarray of providers
    eisArray(mm.exports, 'exports must be an array', (exported) =>
      mm.providers.includes(exported) ? undefined : 'Exported providers must be a subarray of providers'
    );
    mm.exports.forEach((t) => eisInjectable(t));
  }
  if (mm.imports) {
    eisArray(mm.imports, 'imports must be an array');
    mm.imports.forEach((m) => {
      const moduleClass = toModuleClass(m);
      eisModule(moduleClass);
    });
  }
  moduleCache.add(target);
}

/**
 * @param opts Will only check when it is a class
 * @param accessibleProviderTokens injections must be accessible
 */
export function eaccessibleProviders(opts: ProviderOptions, accessibleProviderTokens: Key[]) {
  const tokens = getDependencyTokens(opts);
  if (!tokens) {
    return;
  }

  for (let i = 0; i < tokens.length; i++) {
    const includes = accessibleProviderTokens.includes(tokens[i]);
    expect(
      includes,
      `${String(tokens[i])}(to ${String(ph.getToken(opts))}) is not from current/imported/global module`
    );
  }
}

export function eclear() {
  moduleCache.clear();
  controllerCache.clear();
  injectableCache.clear();
}

function getDependencyTokens(options: ProviderOptions): Key[] | null {
  if (wisClass(options)) {
    const injections = meta.getInject(options);
    if (!wisObject(injections)) {
      return null;
    }
    return Object.values(injections).map((injection) => ph.getInjectToken(injection.dependency));
  }

  if ('useClass' in options) {
    const injections = meta.getInject(options.useClass);
    if (!wisObject(injections)) {
      return null;
    }
    return Object.values(injections).map((injection) => ph.getInjectToken(injection.dependency));
  }

  if ('inject' in options) {
    if (Array.isArray(options.inject)) {
      options.inject.map((arg) => (wisKey(arg) ? arg : arg.name));
    } else {
      return null;
    }
  }

  return null;
}
