import { type Constructor } from '@nestify-js/shared';
import { expectArray, expectClass, expectInjectable } from '@core/asserts/index.js';
import { metaSetProvider, metaSetProviderOnClass } from '@core/register/meta.js';

export function _Injectable(target: Constructor, context: ClassDecoratorContext) {
  expectInjectable(target, context);
  metaSetProvider(context);
}

/**
 * Use on services, configurations, etc.
 */
export function Injectable() {
  return _Injectable;
}

export function toInjectable(target: Constructor, args: any[] = []) {
  expectClass(target, `Target is not a class: ${String(target)} ${Object(target).name}`);
  expectArray(args, 'args must be an array');
  metaSetProviderOnClass(target);
  return target;
}
