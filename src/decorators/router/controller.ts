import { expect } from '@/asserts/index.js';
import meta from '@/register/meta.js';

/**
 * Use to register a controller.
 * @param prefix route prefix, will be added before each route in this class
 */
export function Controller(prefix?: string) {
  return function (target: Class, context: ClassDecoratorContext) {
    expect.injectable(target, context);
    expect.orString(prefix, 'Controller prefix must be a string or undefined');
    meta.setController(context, prefix);
  };
}
