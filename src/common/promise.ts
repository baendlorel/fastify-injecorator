/* eslint-disable @typescript-eslint/no-explicit-any */
import { isPromise } from 'node:util/types';

type EnsurePromise<T> = Promise<T extends Promise<any> ? Awaited<T> : T>;

// * Extend Promise with serial and serialReversed static methods
declare global {
  interface PromiseConstructor {
    try<Fn extends (...args: any[]) => any>(
      fn: Fn,
      thisArg: any,
      ...args: Parameters<Fn>
    ): EnsurePromise<ReturnType<Fn>>;

    trapply<Fn extends (...args: any[]) => any>(
      fn: Fn,
      thisArg: any,
      args: Parameters<Fn>
    ): EnsurePromise<ReturnType<Fn>>;
  }
}

Promise.try = function (fn: Func, thisArg: any, ...args: any[]) {
  try {
    const r = fn.apply(thisArg, args);
    if (isPromise(r)) {
      return r;
    } else {
      return Promise.resolve(r);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};

Promise.trapply = function (fn: Func, thisArg: any, args: any[]) {
  try {
    const r = fn.apply(thisArg, args);
    if (isPromise(r)) {
      return r;
    } else {
      return Promise.resolve(r);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};

export {};
