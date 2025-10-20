import { expect } from '@/asserts/index.js';
import meta from '@/register/meta.js';
import { RouteOptType } from '@/types/index.js';

/**
 * Set route options
 * @param opts Fastify's RouteShorthandOptions
 * @returns
 */
export function Opt<T extends RouteOptType>(opts: T) {
  return function (target: Func, context: StrictClassMethodDecoratorContext) {
    expect.methodDecorator(target, context);
    expect.isObject(opts, `Given opts must be a RouteShorthandOptions of Fastify`);
    meta.setOpt(context, opts);
  };
}
