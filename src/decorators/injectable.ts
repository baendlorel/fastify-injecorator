import { Class } from '@/types/primitive.js';
import { expectArray, expectClass, expectInjectable } from '@/asserts/index.js';
import { metaSetProvider, metaSetProviderOnClass } from '@/register/meta.js';

/**
 * Use on services, configurations, etc.
 */
export function Injectable() {
  return function (target: Class, context: ClassDecoratorContext) {
    expectInjectable(target, context);
    metaSetProvider(context);
  };
}

export function toInjectable(target: Class, args: any[] = []) {
  expectClass(target, `Target is not a class: ${String(target)}`);
  expectArray(args, 'args must be an array');
  metaSetProviderOnClass(target);
  return target;
}
