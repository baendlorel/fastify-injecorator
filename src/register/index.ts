import { FastifyInstance } from 'fastify';
import expectModule from '@/register/expect-module.js';
import moduleRegister from './module.js';

function clear() {
  expectModule.clear();
  // lazyInjector.clear();
  // collection.clear();
}

function normalize(opts: Partial<FastifyInjecoratorOptions>): FastifyInjecoratorOptions {
  const normalized: FastifyInjecoratorOptions = Object(opts);
  expectModule.isModule(normalized.rootModule);
  normalized.allowCrossModuleCircularReference ??= false;

  return normalized;
}

export async function apply(
  app: FastifyInstance,
  partialOpts: Partial<FastifyInjecoratorOptions>
): Promise<void> {
  const opts = normalize(partialOpts);

  moduleRegister.apply(app, opts);

  clear();

  app.log.info(`Modules are all registered`);
}
