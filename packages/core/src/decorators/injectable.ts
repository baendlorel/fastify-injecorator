import { Constructable } from '@nestify/shared';
import { expectArray, expectClass, expectInjectable } from '@core/asserts/index.js';
import { metaSetProvider, metaSetProviderOnClass } from '@core/register/meta.js';

/**
 * Use on services, configurations, etc.
 */
export function Injectable() {
  return function (target: Constructable, context: ClassDecoratorContext) {
    expectInjectable(target, context);
    metaSetProvider(context);
  };
}

export function toInjectable(target: Constructable, args: any[] = []) {
  expectClass(target, `Target is not a class: ${String(target)} ${Object(target).name}`);
  expectArray(args, 'args must be an array');
  metaSetProviderOnClass(target);
  return target;
}
