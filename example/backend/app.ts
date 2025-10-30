import fastify from 'fastify';
import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
import { join } from 'path';

import { apply } from '../../src/register/index.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // Configure JWT secret
  const app = fastify({
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
  });

  // Register multipart for file upload support
  await app.register(multipart as any, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 10,
    },
  });

  // Serve static files (frontend)
  await app.register(staticFiles, {
    root: join(import.meta.dirname, '..', 'frontend'),
    prefix: '/',
  });

  // Apply Injecorator modules
  await apply(app as any, { rootModule: AppModule });

  // Start the server
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen({ port, host });

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
