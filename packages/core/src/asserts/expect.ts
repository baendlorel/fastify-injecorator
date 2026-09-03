import { InjectToken } from '@core/types/injecorator.js';

import { InjecoratorError } from './error.js';
import { _entries, _isArray, _isConstructable } from '@nestify-js/shared';

// # Basic

export const expect: (target: any, msg: string) => asserts target = (target, msg) => {
  if (!target) {
    _throw(msg);
  }
};

export const expectOrString: (o: any, msg: string) => asserts o is string | undefined = (o, msg) => {
  if (o !== undefined && typeof o !== 'string') {
    _throw(msg);
  }
};

export const expectString: (o: any, msg: string) => asserts o is string = (o, msg) => {
  if (typeof o !== 'string') {
    _throw(msg);
  }
};

export const expectOrObject: (o: any, msg: string) => asserts o is object | undefined = (o, msg) => {
  if (o !== undefined && (typeof o !== 'object' || o === null)) {
    _throw(msg);
  }
};

export const expectObject: <T = object>(o: any, msg: string) => asserts o is T = (o, msg) => {
  if (typeof o !== 'object' || o === null) {
    _throw(msg);
  }
};

export const expectKey: (o: any, msg: string) => asserts o is InjectToken = (o, msg) => {
  if (typeof o !== 'string' && typeof o !== 'symbol' && !_isConstructable(o)) {
    _throw(msg);
  }
};

export const expectClass: (o: any, msg: string) => asserts o is new (...args: any) => any = (o, msg) => {
  if (typeof o !== 'function') {
    _throw(msg);
  }

  try {
    const temp = new Proxy(o, { construct: () => ({}) });
    new temp();
  } catch {
    _throw(msg);
  }
};

export const expectBoolean: (o: any, msg: string) => asserts o is boolean = (o, msg) => {
  if (o !== true && o !== false) {
    _throw(msg);
  }
};

export const expectFunction: (o: any, msg: string) => asserts o is (...args: any) => any = (o, msg) => {
  if (typeof o !== 'function') {
    _throw(msg);
  }
};

/**
 * Asserts that `arr` is an array.
 * - If `asserter` is provided, it will be called for each element in the array.
 *   - If it returns a string, it will throw an error with that message.
 *   - If it returns `null` or `undefined`, the element is considered valid.
 *   - If it returns `boolean` and value is `true`, the element is considered valid.
 */
export const expectArray: <T = any>(
  arr: any,
  msg: string,
  predicate?: (value: T, index: number, array: T[]) => void,
) => asserts arr is T[] = (arr, msg, predicate) => {
  if (!_isArray(arr)) {
    throw new InjecoratorError(msg);
  }

  if (predicate) {
    for (let i = 0; i < arr.length; i++) {
      predicate(arr[i], i, arr);
    }
  }
};

export const expectRecord: <V>(
  target: unknown,
  predicate: (value: V, key?: string | symbol) => void,
  msg: string,
) => asserts target is Record<string | symbol, V> = (target, predicate, msg) => {
  expectObject(target, msg);
  for (const [key, value] of _entries(target)) {
    predicate(value, key);
  }
};
