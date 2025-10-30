import { Func } from '@/types/primitive.js';
import { RouteApiSchema } from '@/types/middleware.js';

import { expectMethodDecorator, expectObject } from '@/asserts/index.js';
import { metaSetSchema } from '@/register/meta.js';

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
