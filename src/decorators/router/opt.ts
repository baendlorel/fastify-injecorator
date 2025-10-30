import { Func } from '@/types/primitive.js';
import { RouteOptType } from '@/types/index.js';

import { expectObject, expectMethodDecorator } from '@/asserts/index.js';
import { metaSetOpt } from '@/register/meta.js';

/**
 * Set route options
 * @param opts Fastify's RouteShorthandOptions
 * @returns
 */
export function Opt<T extends RouteOptType>(opts: T) {
  return function (target: Func, context: ClassMethodDecoratorContext) {
    expectMethodDecorator(target, context);
    expectObject(opts, `Given opts must be a RouteShorthandOptions of Fastify`);
    metaSetOpt(context, opts);
  };
}
