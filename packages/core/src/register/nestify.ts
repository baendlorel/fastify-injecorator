/* eslint-disable @typescript-eslint/no-explicit-any */
import fastify, {
  type FastifyServerOptions,
  type FastifyPluginCallback,
  type FastifyPluginAsync,
  type FastifyPluginOptions,
  type FastifyListenOptions,
  type FastifyInstance as NestifyInstance,
} from 'fastify';
import type { Constructor } from '@nestify-js/shared';
import type { NestifyOptions, ProviderOptions } from '@core/types/injecorator.js';

import { apply } from './index.js';

/**
 * A fastify plugin to be registered before modules are applied.
 * - tuple form: `[plugin]` or `[plugin, options]`
 * - both callback-style and async-style plugins are accepted
 */
export type NestifyPluginRegistration = readonly [
  plugin: FastifyPluginCallback<any> | FastifyPluginAsync<any>,
  options?: FastifyPluginOptions,
];

export interface NestifyBootOptions extends Partial<Omit<NestifyOptions, 'rootModule'>> {
  /**
   * Options passed to the fastify factory (`fastify(options)`)
   */
  fastify?: FastifyServerOptions;

  /**
   * Middlewares listed here are no need to be registered in `@Module({providers:[...]})` manually.
   * - Only register, you can use them manually.
   */
  registerGlobalMiddlewares?: ProviderOptions[];

  /**
   * This will be the bottom filter of all filters
   * - Automically applied globally
   */
  useGlobalFilters?: ProviderOptions[];
  /**
   * Execute order: global → controller → route
   * - Automically applied globally
   */
  useGlobalPipes?: ProviderOptions[];
  /**
   * Execute order: global → controller → route → controller → global
   * - Automically applied globally
   */
  useGlobalInterceptors?: ProviderOptions[];
  /**
   * Execute order: global → controller → route
   * - Automically applied globally
   */
  useGlobalGuards?: ProviderOptions[];

  /**
   * Fastify plugins registered before modules are applied
   * @example
   * ```typescript
   * plugins: [
   *   [multipart, { limits: { fileSize: 10 * 1024 * 1024 } }],
   *   [staticFiles, { root: './public', prefix: '/' }],
   * ]
   * ```
   */
  plugins?: readonly NestifyPluginRegistration[];

  /**
   * Start listening after all modules are registered.
   * - `true` to listen with defaults
   * - an object to override `port` / `host` etc.
   *
   * Defaults: `port` = `process.env.PORT` or `3000`, `host` = `process.env.HOST` or `'0.0.0.0'`
   *
   * @default undefined (do not listen; call `app.listen()` yourself)
   */
  listen?: boolean | Partial<FastifyListenOptions>;
}

/**
 * Create a fastify instance, register plugins, apply nestify modules
 * and (optionally) start listening — all in one call.
 *
 * @returns the underlying fastify instance (as `NestifyInstance`)
 * @example
 * ```typescript
 * const app = await nestify(AppModule, {
 *   logger: { level: 'info' },
 *   plugins: [[staticFiles, { root: './public', prefix: '/' }]],
 *   listen: true,
 * });
 * ```
 */
export async function nestify(rootModule: Constructor, opts: NestifyBootOptions = {}): Promise<NestifyInstance> {
  const { fastify: serverOptions, plugins, listen, ...rest } = opts;

  const app = fastify(serverOptions);

  for (const [plugin, options] of plugins ?? []) {
    await app.register(plugin, options);
  }

  await apply(app, { ...rest, rootModule });

  if (listen) {
    await app.listen({
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
      host: process.env.HOST || '0.0.0.0',
      ...(typeof listen === 'object' ? listen : undefined),
    });
  }

  return app;
}
