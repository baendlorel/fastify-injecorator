import { describe, it, expect, afterEach } from 'vitest';
import fastify from 'fastify';

import { apply, Controller, Post, Body, Module, Pipe, UsePipes } from '../src/index.js';
import { injector } from '../../core/src/register/lazy-injector.js';
import type { NestifyPipe, ExecutionContext, PipeFullSchema } from '../src/index.js';

/** A custom pipe decorated by @Pipe but NOT registered in any module providers */
@Pipe()
class CustomPipe implements NestifyPipe {
  async transform(context: ExecutionContext, input: any[], _schema?: PipeFullSchema) {
    return input;
  }
}

describe('auto-instantiation of internal middlewares', () => {
  afterEach(() => {
    injector.clear();
  });

  it('creates instances for built-in pipes without setup option', async () => {
    @Controller('api/auto')
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

    expect(injector.get('PipeBody')).toBeTruthy();

    const response = await app.inject({
      method: 'POST',
      url: '/api/auto/echo/',
      payload: { name: 'test' },
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ received: { name: 'test' } });

    await app.close();
  });

  it('does NOT auto-create instances for user-defined @Pipe classes', async () => {
    @Controller('api/custom')
    class TestController {
      @Post('echo')
      @UsePipes(CustomPipe)
      echo(body: any) {
        return { received: body };
      }
    }

    @Module({ controllers: [TestController] })
    class AppModule {}

    // The custom pipe is not in providers, so route registration must reject
    const app = fastify();
    await expect(apply(app, { rootModule: AppModule })).rejects.toThrow(
      /Cannot find class for token|_throw is not defined/,
    );
    expect(injector.get('CustomPipe')).toBeFalsy();
  });

  it('creates instances for user-defined @Pipe classes registered in providers', async () => {
    @Controller('api/registered')
    class TestController {
      @Post('echo')
      @Body()
      @UsePipes(CustomPipe)
      echo(body: any) {
        return { received: body };
      }
    }

    @Module({ controllers: [TestController], providers: [CustomPipe] })
    class AppModule {}

    const app = fastify();
    await apply(app, { rootModule: AppModule });
    expect(injector.get('CustomPipe')).toBeTruthy();

    const response = await app.inject({
      method: 'POST',
      url: '/api/registered/echo/',
      payload: { name: 'test' },
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ received: { name: 'test' } });

    await app.close();
  });
});
