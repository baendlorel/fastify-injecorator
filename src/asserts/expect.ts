/* eslint-disable @typescript-eslint/no-explicit-any */
import { fnToString } from '@/common/native.js';
import { InjectToken } from '@/types/injecorator.js';
import { whether } from './whether.js';
import { InjecoratorError } from './injecorator-error.class.js';

export const throws = (msg: string): never => {
  throw new InjecoratorError(msg);
};

// # Basic

export const expect: (target: any, msg: string) => asserts target = (target, msg) => {
  if (!target) {
    throws(msg);
  }
};

export const eincludes: (arr: any[], o: any, msg?: string) => void = (arr, o, msg) => {
  if (!arr.includes(o)) {
    throws(msg ?? `'${o}' should be one of [${arr.join(', ')}]`);
  }
};

export const eorString: (o: any, msg: string) => asserts o is string | undefined = (o, msg) => {
  if (o !== undefined && typeof o !== 'string') {
    throws(msg);
  }
};

export const eisString: (o: any, msg: string) => asserts o is string = (o, msg) => {
  if (typeof o !== 'string') {
    throws(msg);
  }
};

export const eorObject: (o: any, msg: string) => asserts o is object | undefined = (o, msg) => {
  if (o !== undefined && (typeof o !== 'object' || o === null)) {
    throws(msg);
  }
};

export const eisObject: <T = object>(o: any, msg: string) => asserts o is T = (o, msg) => {
  if (typeof o !== 'object' || o === null) {
    throws(msg);
  }
};

export const eisKey: (o: any, msg: string) => asserts o is InjectToken = (o, msg) => {
  if (typeof o !== 'string' && typeof o !== 'symbol' && !whether.isClass(o)) {
    throws(msg);
  }
};

export const eisClass: (o: any, msg: string) => asserts o is Class = (o, msg) => {
  if (typeof o !== 'function') {
    throws(msg);
  }
  const str = fnToString.call(o);
  // & This is better than using pseudo calling
  if (!str.startsWith('class ') && !str.startsWith('[class ')) {
    throws(msg);
  }
};

export const eisBoolean: (o: any, msg: string) => asserts o is boolean = (o, msg) => {
  if (o !== true && o !== false) {
    throws(msg);
  }
};

export const eisUndefined: (o: any, msg: string) => asserts o is undefined = (o, msg) => {
  if (o !== undefined) {
    throws(msg);
  }
};

export const eisFunction: (o: any, msg: string) => asserts o is Func = (o, msg) => {
  if (typeof o !== 'function') {
    throws(msg);
  }
};

/**
 * Asserts that `arr` is an array.
 * - If `asserter` is provided, it will be called for each element in the array.
 *   - If it returns a string, it will throw an error with that message.
 *   - If it returns `null` or `undefined`, the element is considered valid.
 *   - If it returns `boolean` and value is `true`, the element is considered valid.
 */
export const eisArray = <T = any>(
  arr: any,
  msg: string,
  predicate?: (value: T, index: number, array: T[]) => void
): asserts arr is T[] => {
  if (!Array.isArray(arr)) {
    throw new InjecoratorError(msg);
  }

  if (predicate) {
    for (let i = 0; i < arr.length; i++) {
      predicate(arr[i], i, arr);
    }
  }
};

export const eisRecord: <V>(
  target: unknown,
  predicate: (value: V, key?: Key) => void,
  msg: string
) => asserts target is Record<Key, V> = (target, predicate, msg) => {
  eisObject(target, msg);
  for (const [key, value] of Object.entries(target)) {
    predicate(value, key);
  }
};
