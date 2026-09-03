import { _getPrototypeOf } from './native.js';

type ArrValue<T> = T extends readonly (infer U)[] ? U : never;
export const concatArr = <T extends readonly unknown[]>(...args: (T | undefined)[]) => {
  if (0 === args.length) {
    return [] as ArrValue<T>[];
  }
  return args.filter(Array.isArray).flat() as ArrValue<T>[];
};

export const toAssigned = (...args: (object | symbol | undefined)[]) =>
  Object.assign({}, ...args.filter((v) => v && typeof v === 'object'));

/**
 * Like `instanceof`, but works with classes that are not instantiated.
 * - Returns `true` if they are the same class.
 * @param subClass The class to check
 * @param superClass The potential parent class
 */
export function subclassOf(subClass: new (...args: any) => any, superClass: new (...args: any) => any): boolean {
  if (subClass === superClass) {
    return true;
  }

  for (let proto = _getPrototypeOf(subClass); proto && proto !== Function.prototype; proto = _getPrototypeOf(proto)) {
    if (proto === superClass) {
      return true;
    }
  }

  return false;
}
