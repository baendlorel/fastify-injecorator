import { Class, Func, Key } from '@core/types/primitive.js';
import {
  InjectToken,
  InjectArg,
  ProviderOptions,
  ProviderStandardOptions,
  ProviderUseClass,
  ProviderUseFactory,
  ProviderUseExisting,
} from '@core/types/injecorator.js';

import { $fnToString, $isArray } from '@core/common/native.js';
import { metaGetModule } from '@core/register/meta.js';

export function isObject<T extends object>(o: any): o is T {
  return typeof o === 'object' && o !== null;
}

export function isKey(o: unknown): o is Key {
  return typeof o === 'string' || typeof o === 'symbol';
}

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
 * Asserts that `arr` is an array.
 * - If `predicate` is provided, it will be called for each element in the array.
 *   - If it returns a string, it will throw an error with that message.
 *   - If it returns `null` or `undefined`, the element is considered valid.
 *   - If it returns `boolean` and value is `true`, the element is considered valid.
 * @param arr target array
 * @param predicate function to validate each element
 */
export function isArray<T = any>(arr: any, predicate?: (value: T, index: number, array: T[]) => boolean): arr is T[] {
  if (!$isArray(arr)) {
    return false;
  }

  if (!predicate) {
    return true;
  }

  for (let i = 0; i < arr.length; i++) {
    const result = predicate(arr[i], i, arr);
    if (result === false) {
      return false;
    }
  }
  return true;
}

export function isError<T extends Error>(o: any): o is T {
  return o instanceof Error;
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
  const str = $fnToString.call(o).replace(/\s/g, '');
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
  if (arr.some((a) => a && !isArray(a))) {
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
