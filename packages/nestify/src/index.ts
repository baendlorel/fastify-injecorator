// Main Fastify integration package
// Re-exports core, schema, and swagger for all-in-one usage

export * from '@nestify/core';
export * from '@nestify/schema';
export * from '@nestify/swagger';
export { HttpStatus } from '@nestify/shared';

// common keys
export { APP_LOGGER, APP_INTERCEPTOR, APP_FILTER, APP_GUARD, APP_PIPE } from '@nestify/shared';

// Wrapper apply that automatically includes basic pipes setup
import type { FastifyInstance } from 'fastify';
import type { FastifyInjecoratorOptions } from '@nestify/core';
import { fastifyInjecorator as coreApply } from '@nestify/core';
import { setupBasicPipes } from '@nestify/core';

/**
 * Apply Injecorator modules to a Fastify instance.
 *
 * Unlike the core `fastifyInjecorator`, this wrapper automatically
 * registers basic pipes (Body, Params, Query, Ip, Raw) via `setupBasicPipes`.
 *
 * Pass `setup` explicitly to override the default behavior.
 */
export async function apply(app: FastifyInstance, opts: Partial<FastifyInjecoratorOptions>): Promise<void> {
  return coreApply(app, { ...opts, setup: opts.setup ?? setupBasicPipes });
}
