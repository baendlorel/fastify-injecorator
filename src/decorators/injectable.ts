import { Class } from '@/types/primitive.js';
import { eisArray, eisClass, eisInjectable } from '@/asserts/index.js';
import meta from '@/register/meta.js';

/**
 * Use on services, configurations, etc.
 */
export function Injectable() {
  return function (target: Class, context: ClassDecoratorContext) {
    eisInjectable(target, context);
    meta.setProvider(context);
  };
}

export function toInjectable(target: Class, args: any[] = []) {
  eisClass(target, `Target is not a class: ${String(target)}`);
  eisArray(args, 'args must be an array');
  meta.setProviderOnClass(target);
  return target;
}
