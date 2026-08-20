import type { Constructable, Func, Key } from '@nestify-js/shared';
import { _fnToString, _isArray } from '@nestify-js/shared';
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

export function _isObject<T extends object>(o: unknown): o is T {
  return typeof o === 'object' && o !== null;
}

export function _isKey(o: unknown): o is Key {
  return typeof o === 'string' || typeof o === 'symbol';
}

/**
 * Only criterion: newable
 */
export function _isConstructable(o: any): o is Constructable {
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

export function _isFunction(o: any): o is Func {
  return typeof o === 'function';
}

export function _orFunction(o: any): o is Func | undefined {
  return typeof o === 'function' || o === undefined;
}

export function _isPathNode(p: string): boolean {
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
export function likeModule(target: unknown): target is Constructable {
  if (!_isConstructable(target)) {
    return false;
  }
  const o = metaGetModule(target);
  if (!_isObject(o)) {
    return false;
  }

  const arr = [o.controllers, o.exports, o.providers, o.imports];
  if (arr.some((a) => !_isArray(a))) {
    return false;
  }
  return true;
}

export function isInjectToken(target: any): target is InjectToken {
  if (_isKey(target)) {
    return true;
  }

  if (_isConstructable(target)) {
    return true;
  }

  return false;
}

export function isInjectArg(target: any): target is InjectArg {
  if (_isKey(target)) {
    return true;
  }

  if (_isConstructable(target)) {
    return true;
  }

  if (_isFunction(target) && _isConstructable(target())) {
    return true;
  }

  return false;
}

export function isProviderOptions(target: unknown): target is ProviderOptions {
  // Class provider: direct class
  if (_isConstructable(target)) {
    return true;
  }
  // Object provider: must have provide key
  if (!_isObject<ProviderStandardOptions>(target)) {
    return false;
  }
  if (!_isKey(target.provide)) {
    return false;
  }

  if (_isConstructable((target as ProviderUseClass).useClass)) {
    return true;
  }

  if ('useValue' in target) {
    return true;
  }

  if (_isFunction((target as ProviderUseFactory).useFactory)) {
    return true;
  }

  if (_isKey((target as ProviderUseExisting).useExisting)) {
    return true;
  }

  // fallback: not a valid provider
  return false;
}
