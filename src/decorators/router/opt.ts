import { Func } from '@/types/primitive.js';
import { RouteOptType } from '@/types/index.js';

import { eisObject, eisMethodDecorator } from '@/asserts/index.js';
import meta from '@/register/meta.js';

/**
 * Set route options
 * @param opts Fastify's RouteShorthandOptions
 * @returns
 */
export function Opt<T extends RouteOptType>(opts: T) {
  return function (target: Func, context: ClassMethodDecoratorContext) {
    eisMethodDecorator(target, context);
    eisObject(opts, `Given opts must be a RouteShorthandOptions of Fastify`);
    meta.setOpt(context, opts);
  };
}
