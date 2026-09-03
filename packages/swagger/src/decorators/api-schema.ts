import { type AnyFunction } from '@nestify-js/shared';
import type { RouteApiSchema } from '@nestify-js/core';
import { expectMethodDecorator, expectObject, metaSetSchema } from '@nestify-js/core';

/**
 * Set api schema info, **not validation schema**
 * @param schema FastifySchema with 'summary','description'...
 */
export function ApiSchema<T extends RouteApiSchema>(schema: T) {
  return function (target: AnyFunction, context: ClassMethodDecoratorContext) {
    expectMethodDecorator(target, context);
    expectObject(schema, `Given opts must be a RouteShorthandOptions of Fastify`);

    metaSetSchema(context, schema);
  };
}
