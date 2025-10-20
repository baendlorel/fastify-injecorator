/* eslint-disable @typescript-eslint/no-explicit-any */
import meta from '@/register/meta.js';

/**
 * It is impossible to type the expecter as an assert function.
 * So we should do it manually blow the class definition.
 */
class UntypedWhether extends Function {
  constructor() {
    super('o', `return !!o`);
  }

  /**
   * Cache the results
   *
   */
  readonly moduleCache = new Set<any>();
  readonly controllerCache = new Set<any>();
  readonly injectableCache = new Set<any>();

  isObject<T extends object>(o: any): o is T {
    return typeof o === 'object' && o !== null;
  }

  isKey(o: unknown): o is Key {
    return typeof o === 'string' || typeof o === 'symbol';
  }

  isClass(o: any): o is Class {
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

  isFunction(o: any): o is Func {
    return typeof o === 'function';
  }

  isPathNode(p: string) {
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
   * @param msg
   */
  isArray<T = any>(
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

  isError<T extends Error>(o: any): o is T {
    return o instanceof Error;
  }

  /**
   * The goal is to tell whether the target is like `() => ProviderClass`
   * - Might be not so accurate under some extreme circumstances like bound functions or proxied functions, etc.
   *   - So we just don't allow such cases.
   * @see https://github.com/baendlorel/get-function-features
   * @see https://github.com/baendlorel/js-is-arrow-function
   */
  isInjectedClassGetter(o: unknown): o is Func {
    if (typeof o !== 'function') {
      return false;
    }
    const str = Function.prototype.toString.call(o).replace(/\s/g, '');
    // Match '=>' not preceded by any quote character
    return str.startsWith('()=>');
  }

  /**
   * Roughly check if the target looks like a module
   * @param target
   * @returns
   */
  likeModule(target: unknown): target is Class {
    if (!this.isClass(target)) {
      return false;
    }
    const o = meta.getModule(target);
    if (!this.isObject(o)) {
      return false;
    }

    const arr = [o.controllers, o.exports, o.providers, o.imports];
    if (arr.some((a) => a && !this.isArray(a))) {
      return false;
    }
    return true;
  }

  isInjectToken(target: InjectToken): target is InjectToken {
    if (this.isKey(target)) {
      return true;
    }

    if (this.isClass(target)) {
      return true;
    }

    return false;
  }

  isInjectArg(target: InjectArg): target is InjectArg {
    if (this.isKey(target)) {
      return true;
    }

    if (this.isClass(target)) {
      return true;
    }

    if (this.isFunction(target) && this.isClass(target())) {
      return true;
    }

    return false;
  }

  isProviderOptions(target: unknown): target is ProviderOptions {
    // Class provider: direct class
    if (this.isClass(target)) {
      return true;
    }
    // Object provider: must have provide key
    if (!this.isObject<ProviderStandardOptions>(target)) {
      return false;
    }
    if (!this.isKey(target.provide)) {
      return false;
    }

    if ('useClass' in target && this.isClass(target.useClass)) {
      return true;
    }

    if ('useValue' in target) {
      return true;
    }

    if ('useFactory' in target && this.isFunction(target.useFactory)) {
      return true;
    }

    if ('useExisting' in target && this.isKey(target.useExisting)) {
      return true;
    }

    // fallback: not a valid provider
    return false;
  }
}

/**
 * Expect the target to be truthy.
 * @param target
 */
export const whether = new UntypedWhether();
