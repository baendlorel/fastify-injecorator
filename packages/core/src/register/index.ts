import { type FastifyInstance as NestifyInstance } from 'fastify';
import { NestifyOptions } from '@core/types/injecorator.js';
import { startCronJobs } from '@core/schedule/cron.js';

import { clearExpectCache, expectModule } from './expect-module.js';
import moduleRegister from './module.js';

function clear() {
  clearExpectCache();
  // lazyInjector.clear();
  // collection.clear();
}

function normalize(opts: Partial<NestifyOptions>): NestifyOptions {
  const normalized: NestifyOptions = Object(opts);
  expectModule(normalized.rootModule);
  normalized.allowCrossModuleCircularReference ??= false;

  return normalized;
}

export async function apply(app: NestifyInstance, partialOpts: Partial<NestifyOptions>): Promise<void> {
  const opts = normalize(partialOpts);

  moduleRegister.apply(app, opts);

  clear();

  console.log(`Modules are all registered`);

  // Start cron jobs after all modules are initialized
  startCronJobs();
}
