import { TaskifyAsync } from 'serial-task';
import { FastifyReply, FastifyRequest } from 'fastify';
import { expect } from '@/asserts/expect.js';
import { ExecutionContext } from '@/common/execution-context.class.js';
import { FilterTask, GuardTask, InterceptorTask, PipeTask } from '@/types/middleware.js';

async function run(fns: Func[]) {
  for (let i = 0; i < fns.length; i++) {
    await fns[i]();
  }
}
interface MiddlewareGroup {
  guard: TaskifyAsync<GuardTask>;
  interceptor: TaskifyAsync<InterceptorTask>;
  pipe: TaskifyAsync<PipeTask>;
  filter: TaskifyAsync<FilterTask>;
}

export function createHandler(controller: Class, method: Func, middlewares: MiddlewareGroup) {
  const { guard, interceptor, pipe, filter } = middlewares;
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const context = new ExecutionContext([request, reply], 'http', controller, method);
    try {
      // Interceptor enter
      const interceptResult = await interceptor(context);

      // Guard
      await guard(context);

      // Pipe
      const piped = await pipe(context);
      if (piped.trivial) {
        piped.value = [request, reply];
      } else {
        expect.isAnyArray(piped.value, `Pipe must return an array, but got: ${String(piped)}`);
      }

      // Handler
      const result = await method(...piped.value);

      // todo pipe也要第二次运行，用来返回值校验

      // Interceptor leave
      const leaves = interceptResult.results.filter((v) => typeof v === 'function').reverse();
      await run(leaves);

      return result;
    } catch (error) {
      // Filter
      await filter(context, error);
    }
  };
}
