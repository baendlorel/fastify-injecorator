import { describe, it, expect, afterEach } from 'vitest';
import fastify from 'fastify';

import { apply, Controller, Get, Module, Pipe, Guard, UseGuards } from '../src/index.js';
import { injector } from '@core/register/lazy-injector.js';
import type { ExecutionContext } from '../src/index.js';

const calls: string[] = [];

@Pipe()
class PipeA {
  transform(_context: ExecutionContext, previousReturn: any) {
    calls.push('pipeA');
    return previousReturn;
  }
}
@Pipe()
class PipeB {
  transform(_context: ExecutionContext) {
    calls.push('pipeB');
    // last pipe returns the handler args
    return [];
  }
}
@Guard()
class GuardA {
  canActivate(_context: ExecutionContext) {
    calls.push('guardA');
    return true;
  }
}
@Guard()
class GuardB {
  canActivate(_context: ExecutionContext) {
    calls.push('guardB');
    return true;
  }
}

@Controller('t')
class TController {
  @Get('x')
  x() {
    return { ok: true };
  }
}
@Controller('t2')
@UseGuards(GuardB)
class T2Controller {
  @Get('y')
  y() {
    return { ok: true };
  }
}

@Module({ controllers: [TController, T2Controller] })
class AppModule {}

describe('useGlobalXXX boot options', () => {
  afterEach(() => {
    injector.clear();
    calls.length = 0;
  });

  it('applies globals in array order, guards before route-level ones', async () => {
    const app = fastify();
    await apply(app, {
      rootModule: AppModule,
      registerGlobalMiddlewares: [GuardB],
      useGlobalPipes: [PipeA, PipeB],
      useGlobalGuards: [GuardA],
    });

    const res = await app.inject({ method: 'GET', url: '/t/x/' });
    expect(res.statusCode).toBe(200);
    // guards first, in array order; then pipes, in array order
    expect(calls).toEqual(['guardA', 'pipeA', 'pipeB']);

    calls.length = 0;
    const res2 = await app.inject({ method: 'GET', url: '/t2/y/' });
    expect(res2.statusCode).toBe(200);
    // global guard runs before controller-level guard (registered via registerGlobalMiddlewares)
    expect(calls).toEqual(['guardA', 'guardB', 'pipeA', 'pipeB']);

    await app.close();
  });
});
