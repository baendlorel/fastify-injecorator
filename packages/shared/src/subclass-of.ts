import type { Class } from './types/primitive.js';
import { _getPrototypeOf } from '@nestify/shared';

/**
 * Like `instanceof`, but works with classes that are not instantiated.
 * - Returns `true` if they are the same class.
 * @param subClass The class to check
 * @param superClass The potential parent class
 */
export function subclassOf(subClass: Class, superClass: Class): boolean {
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
