import { describe, it, expect, afterEach } from 'vitest';
import fastify from 'fastify';

import { apply, Controller, Get, Post, Module, Body } from '../src/index.js';
import { injector } from '@core/register/lazy-injector.js';

describe('Nestify wrapper apply', () => {
  afterEach(() => {
    injector.clear();
  });

  it('should auto-register basic pipes and handle @Body correctly', async () => {
    @Controller('api/test')
    class TestController {
      @Post('echo')
      @Body()
      echo(body: any) {
        return { received: body };
      }
    }

    @Module({ controllers: [TestController] })
    class AppModule {}

    const app = fastify();
    await apply(app, { rootModule: AppModule });

    const response = await app.inject({
      method: 'POST',
      url: '/api/test/echo/',
      payload: { name: 'test', value: 42 },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.received).toEqual({ name: 'test', value: 42 });

    await app.close();
  });

  it('should handle GET requests without pipes', async () => {
    @Controller('api/simple')
    class SimpleController {
      @Get('hello')
      hello() {
        return { message: 'world' };
      }
    }

    @Module({ controllers: [SimpleController] })
    class AppModule {}

    const app = fastify();
    await apply(app, { rootModule: AppModule });

    const response = await app.inject({
      method: 'GET',
      url: '/api/simple/hello/',
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.message).toBe('world');

    await app.close();
  });

  it('should register middlewares from registerGlobalMiddlewares', async () => {
    @Controller('api/custom')
    class CustomController {
      @Get('ping')
      ping() {
        return { pong: true };
      }
    }

    @Module({ controllers: [CustomController] })
    class AppModule {}

    const app = fastify();
    await apply(app, {
      rootModule: AppModule,
      registerGlobalMiddlewares: [],
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/custom/ping/',
    });

    expect(response.statusCode).toBe(200);

    await app.close();
  });
});
