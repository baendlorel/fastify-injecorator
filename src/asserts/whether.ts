/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectToken, InjectArg, ProviderOptions, ProviderStandardOptions } from '@/types/injecorator.js';
import meta from '@/register/meta.js';
import { fnToString } from '@/common/native.js';

/**
 * Cache for results
 */
const moduleCache = new Set<any>();
const controllerCache = new Set<any>();
const injectableCache = new Set<any>();

export function wisObject<T extends object>(o: any): o is T {
  return typeof o === 'object' && o !== null;
}

export function wisKey(o: unknown): o is Key {
  return typeof o === 'string' || typeof o === 'symbol';
}

export function wisClass(o: any): o is Class {
  if (typeof o !== 'function') {
    return false;
  }
  try {
    // No side effects, just to check if it is a class
    new new Proxy(o, { construct: () => ({}) })();
    return true;
  } catch {
    return false;
  }
}

export function wisFunction(o: any): o is Func {
  return typeof o === 'function';
}

export function wisPathNode(p: string): boolean {
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
export function wisArray<T = any>(
  arr: any,
  predicate?: (value: T, index?: number, array?: T[]) => boolean
): arr is T[] {
  if (!Array.isArray(arr)) {
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

export function wisError<T extends Error>(o: any): o is T {
  return o instanceof Error;
}

/**
 * The goal is to tell whether the target is like `() => ProviderClass`
 * - Might be not so accurate under some extreme circumstances like bound functions or proxied functions, etc.
 *   - So we just don't allow such cases.
 * @see https://github.com/baendlorel/get-function-features
 * @see https://github.com/baendlorel/js-is-arrow-function
 */
export function wisInjectedClassGetter(o: unknown): o is Func {
  if (typeof o !== 'function') {
    return false;
  }
  const str = fnToString.call(o).replace(/\s/g, '');
  // Match '=>' not preceded by any quote character
  return str.startsWith('()=>');
}

/**
 * Roughly check if the target looks like a module
 * @param target
 * @returns
 */
export function wisLikeModule(target: unknown): target is Class {
  if (!wisClass(target)) {
    return false;
  }
  const o = meta.getModule(target);
  if (!wisObject(o)) {
    return false;
  }

  const arr = [o.controllers, o.exports, o.providers, o.imports];
  if (arr.some((a) => a && !wisArray(a))) {
    return false;
  }
  return true;
}

export function wisInjectToken(target: any): target is InjectToken {
  if (wisKey(target)) {
    return true;
  }

  if (wisClass(target)) {
    return true;
  }

  return false;
}

export function wisInjectArg(target: any): target is InjectArg {
  if (wisKey(target)) {
    return true;
  }

  if (wisClass(target)) {
    return true;
  }

  if (wisFunction(target) && wisClass(target())) {
    return true;
  }

  return false;
}

export function wisProviderOptions(target: unknown): target is ProviderOptions {
  // Class provider: direct class
  if (wisClass(target)) {
    return true;
  }
  // Object provider: must have provide key
  if (!wisObject<ProviderStandardOptions>(target)) {
    return false;
  }
  if (!wisKey(target.provide)) {
    return false;
  }

  if (wisClass((target as any).useClass)) {
    return true;
  }

  if ('useValue' in target) {
    return true;
  }

  if (wisFunction((target as any).useFactory)) {
    return true;
  }

  if (wisKey((target as any).useExisting)) {
    return true;
  }

  // fallback: not a valid provider
  return false;
}
