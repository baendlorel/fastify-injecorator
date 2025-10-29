import { FastifyInstance } from 'fastify';
import { toAssigned } from 'to-assigned';
import { Class } from '@/types/primitive.js';

import { sym, $values } from '@/common/index.js';
import lazyInjector from '../lazy-injector.js';
import meta from '../meta.js';

// middlewares
import { createHandler } from './handler.js';
import { createGuard } from './middlewares/guard.js';
import { createFilter } from './middlewares/filter.js';
import { createPipe } from './middlewares/pipe.js';
import { createInterceptor } from './middlewares/interceptor.js';

function concatRoute(...routes: string[][]): string {
  const flatRoutes = routes
    .flat()
    .map((r) => r.split('/'))
    .flat()
    .filter(Boolean);
  if (flatRoutes.length === 0) {
    return '/';
  }
  return '/' + flatRoutes.map((r) => `${r}/`).join('');
}

export function registerController(app: FastifyInstance, controller: Class, modulePrefix: string[]) {
  const controllerPrefix = meta.getController(controller).prefix;
  const routes = meta.getRoute(controller);
  const instance = lazyInjector.createInstance(controller);

  // middlewares
  const getInterceptors = meta.getUseInterceptors(controller);
  const getGuards = meta.getUseGuards(controller);
  const getFilters = meta.getUseFilters(controller);
  const getPipes = meta.getUsePipes(controller);

  $values(routes).forEach((routeConfig) => {
    const { field, method, route } = routeConfig[sym.route.base];
    const url = concatRoute(modulePrefix, controllerPrefix, route);
    const opts = routeConfig[sym.route.opt] ?? {};
    const ApiSchema = routeConfig[sym.route.apiSchema]; // Schema info, includes `summary`, `description`, etc.

    // fixme 应该在这里就解决函数名字问题
    // Get the original method from the instance
    const originalMethod = instance[field];

    const interceptor = createInterceptor(getInterceptors(field));
    const guard = createGuard(getGuards(field));
    const filter = createFilter(getFilters(field));
    const pipe = createPipe(getPipes(field));
    const firstMethodPipeSchema = meta.getFirstMethodPipeSchema(controller, field);
    opts.schema = toAssigned(opts.schema, ApiSchema, firstMethodPipeSchema); // Here schema is for swagger

    // Pass the original method (with correct name) and instance for 'this' binding
    const handler = createHandler(controller, originalMethod, { interceptor, guard, filter, pipe });

    app.log.info(`${url} (${method.toUpperCase()})`);

    app.route({
      ...opts,
      method,
      url,
      handler,
    });
  });
}
