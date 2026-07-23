import type { Func } from '@nestify/shared';
import type { RouteApiSchema } from '@nestify/core';
import { expectMethodDecorator, expectObject, metaSetSchema } from '@nestify/core';

/**
 * Set api schema info, **not validation schema**
 * @param schema FastifySchema with 'summary','description'...
 */
export function ApiSchema<T extends RouteApiSchema>(schema: T) {
  return function (target: Func, context: ClassMethodDecoratorContext) {
    expectMethodDecorator(target, context);
    expectObject(schema, `Given opts must be a RouteShorthandOptions of Fastify`);

    metaSetSchema(context, schema);
  };
}
