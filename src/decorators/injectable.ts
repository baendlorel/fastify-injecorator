import { expect } from '@/asserts/index.js';
import meta from '@/register/meta.js';

/**
 * Use on services, configurations, etc.
 */
export function Injectable() {
  return function (target: Class, context: ClassDecoratorContext) {
    expect.injectable(target, context);
    meta.setProvider(context);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toInjectable(target: Class, args: any[] = []) {
  expect.isClass(target, `Target is not a class: ${String(target)}`);
  expect.isArray(args);
  meta.setProviderOnClass(target);
  return target;
}
