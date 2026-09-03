import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
import { join } from 'path';

import { nestify, setupBasicPipes } from '../../packages/core/src/index.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  await nestify(AppModule, {
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },

    // Register multipart for file upload support
    // and serve static files (frontend)
    // NOTE: `as any` is only needed because this example imports core
    // directly from source, so two fastify copies (example's and the root
    // workspace's) coexist and their types don't unify.
    plugins: [
      [multipart as any, { limits: { fileSize: 10 * 1024 * 1024, files: 10 } }],
      [staticFiles as any, { root: join(import.meta.dirname, '..', 'frontend'), prefix: '/' }],
    ],

    setup: setupBasicPipes,

    // Start the server (port/host default to PORT / HOST env, then 3000 / 0.0.0.0)
    listen: true,
  });

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  console.log(`
🚀 Server is running!
📡 API: http://localhost:${port}/api
🌐 Frontend: http://localhost:${port}
  `);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
