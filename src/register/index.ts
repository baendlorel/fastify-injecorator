import { FastifyInstance } from 'fastify';
import { FastifyInjecoratorOptions } from '@/types/injecorator.js';
import { startCronJobs } from '@/schedule/cron.js';

import { eclear, eisModule } from './expect-module.js';
import moduleRegister from './module.js';

function clear() {
  eclear();
  // lazyInjector.clear();
  // collection.clear();
}

function normalize(opts: Partial<FastifyInjecoratorOptions>): FastifyInjecoratorOptions {
  const normalized: FastifyInjecoratorOptions = Object(opts);
  eisModule(normalized.rootModule);
  normalized.allowCrossModuleCircularReference ??= false;

  return normalized;
}

export async function apply(app: FastifyInstance, partialOpts: Partial<FastifyInjecoratorOptions>): Promise<void> {
  const opts = normalize(partialOpts);

  moduleRegister.apply(app, opts);

  clear();

  app.log.info(`Modules are all registered`);

  // Start cron jobs after all modules are initialized
  startCronJobs();
}
