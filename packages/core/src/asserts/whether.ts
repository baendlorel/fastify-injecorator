import { Class, Func, Key } from '@nestify/shared';
import {
  InjectToken,
  InjectArg,
  ProviderOptions,
  ProviderStandardOptions,
  ProviderUseClass,
  ProviderUseFactory,
  ProviderUseExisting,
} from '@core/types/injecorator.js';

import { metaGetModule } from '@core/register/meta.js';
import { _fnToString, _isArray } from '@nestify/shared';

export function isObject<T extends object>(o: any): o is T {
  return typeof o === 'object' && o !== null;
}

export function isKey(o: unknown): o is Key {
  return typeof o === 'string' || typeof o === 'symbol';
}

/**
 * Only criterion: newable
 */
export function isClass(o: any): o is Class {
  if (typeof o !== 'function') {
    return false;
  }

  try {
    const temp = new Proxy(o, { construct: () => ({}) });
    new temp();
    return true;
  } catch {
    return false;
  }
}

export function isFunction(o: any): o is Func {
  return typeof o === 'function';
}

export function orFunction(o: any): o is Func | undefined {
  return typeof o === 'function' || o === undefined;
}

export function isPathNode(p: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(p);
}

/**
 * The goal is to tell whether the target is like `() => ProviderClass`
 * - Might be not so accurate under some extreme circumstances like bound functions or proxied functions, etc.
 *   - So we just don't allow such cases.
 * @see https://github.com/baendlorel/get-function-features
 * @see https://github.com/baendlorel/js-is-arrow-function
 */
export function isInjectedClassGetter(o: unknown): o is Func {
  if (typeof o !== 'function') {
    return false;
  }
  const str = _fnToString.call(o).replace(/\s/g, '');
  // Match '=>' not preceded by any quote character
  return str.startsWith('()=>');
}

/**
 * Roughly check if the target looks like a module
 * @param target
 * @returns
 */
export function likeModule(target: unknown): target is Class {
  if (!isClass(target)) {
    return false;
  }
  const o = metaGetModule(target);
  if (!isObject(o)) {
    return false;
  }

  const arr = [o.controllers, o.exports, o.providers, o.imports];
  if (arr.some((a) => !_isArray(a))) {
    return false;
  }
  return true;
}

export function isInjectToken(target: any): target is InjectToken {
  if (isKey(target)) {
    return true;
  }

  if (isClass(target)) {
    return true;
  }

  return false;
}

export function isInjectArg(target: any): target is InjectArg {
  if (isKey(target)) {
    return true;
  }

  if (isClass(target)) {
    return true;
  }

  if (isFunction(target) && isClass(target())) {
    return true;
  }

  return false;
}

export function isProviderOptions(target: unknown): target is ProviderOptions {
  // Class provider: direct class
  if (isClass(target)) {
    return true;
  }
  // Object provider: must have provide key
  if (!isObject<ProviderStandardOptions>(target)) {
    return false;
  }
  if (!isKey(target.provide)) {
    return false;
  }

  if (isClass((target as ProviderUseClass).useClass)) {
    return true;
  }

  if ('useValue' in target) {
    return true;
  }

  if (isFunction((target as ProviderUseFactory).useFactory)) {
    return true;
  }

  if (isKey((target as ProviderUseExisting).useExisting)) {
    return true;
  }

  // fallback: not a valid provider
  return false;
}
