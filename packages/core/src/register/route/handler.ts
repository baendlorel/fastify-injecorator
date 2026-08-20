import type { Func, Constructable } from '@nestify-js/shared';
import type { FilterTask, GuardTask, InterceptorTask, PipeTask } from '@core/types/middleware.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { TaskifyAsync } from 'serial-task';

import { expectArray, _isFunction } from '@core/asserts/index.js';
import { ExecutionContext } from '@core/common/execution-context.js';

async function run(fns: Func[], ...args: any[]) {
  for (let i = 0; i < fns.length; i++) {
    await fns[i](...args);
  }
}
interface MiddlewareGroup {
  guard: TaskifyAsync<GuardTask>;
  interceptor: TaskifyAsync<InterceptorTask>;
  pipe: TaskifyAsync<PipeTask>;
  filter: TaskifyAsync<FilterTask>;
}

export function createHandler(controller: Constructable, method: Func, middlewares: MiddlewareGroup) {
  const { guard, interceptor, pipe, filter } = middlewares;
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const context = new ExecutionContext([request, reply], 'http', controller, method);

    // Interceptor enter
    const interceptResult = await interceptor(context);

    try {
      // Guard
      await guard(context);

      // Pipe
      const piped = await pipe(context);
      if (piped.trivial) {
        piped.value = [request, reply];
      } else {
        expectArray(piped.value, `Pipe must return an array, but got: ${String(piped)}`);
      }

      // Handler
      const result = await method(...piped.value);

      // todo pipe也要第二次运行，用来返回值校验

      // Interceptor leave
      const leaves = interceptResult.results.filter(_isFunction).reverse();
      await run(leaves, result);

      return result;
    } catch (error) {
      // Interceptor leave (cleanup on error)
      const leaves = interceptResult.results.filter(_isFunction).reverse();
      await run(leaves, error);

      // Filter
      await filter(context, error);
    }
  };
}
