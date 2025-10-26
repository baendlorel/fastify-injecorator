import { RouteApiSchema } from '@/types/middleware.js';
import { eisMethodDecorator, eisObject } from '@/asserts/index.js';
import meta from '@/register/meta.js';

/**
 * Set api schema info, **not validation schema**
 * @param schema FastifySchema with 'summary','description'...
 */
export function ApiSchema<T extends RouteApiSchema>(schema: T) {
  return function (target: Func, context: ClassMethodDecoratorContext) {
    eisMethodDecorator(target, context);
    eisObject(schema, `Given opts must be a RouteShorthandOptions of Fastify`);

    meta.setSchema(context, schema);
  };
}
