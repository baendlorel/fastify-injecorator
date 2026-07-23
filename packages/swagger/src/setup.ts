import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export interface SwaggerSetupOptions {
  /**
   * Options for @fastify/swagger
   * @see https://github.com/fastify/fastify-swagger
   */
  swagger?: Parameters<typeof swagger>[0];

  /**
   * Options for @fastify/swagger-ui
   * @see https://github.com/fastify/fastify-swagger-ui
   */
  ui?: Parameters<typeof swaggerUi>[0];
}

/**
 * Register @fastify/swagger and @fastify/swagger-ui plugins.
 *
 * @example
 * ```typescript
 * import Fastify from 'fastify';
 * import { setupSwagger } from '@nestify/swagger';
 *
 * const app = Fastify();
 * await setupSwagger(app, {
 *   swagger: { info: { title: 'My API', version: '1.0.0' } },
 *   ui: { routePrefix: '/docs' },
 * });
 * ```
 */
export async function setupSwagger(app: FastifyInstance, options: SwaggerSetupOptions = {}) {
  await app.register(swagger, options.swagger);
  await app.register(swaggerUi, options.ui);
}
