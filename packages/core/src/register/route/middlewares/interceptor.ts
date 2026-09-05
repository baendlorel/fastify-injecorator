import { createSerialTaskAsync, TaskifyAsync } from 'serial-task';
import { InjectToken } from '@core/types/injection.js';
import { InterceptorTask, NestifyInterceptor } from '@core/types/middleware.js';
import { injector } from '@core/register/lazy-injector.js';

/**
 * Create a preValidation hook for the route
 */
export function createInterceptor(tokens: InjectToken[]): TaskifyAsync<InterceptorTask> {
  return createSerialTaskAsync<InterceptorTask>({
    tasks: injector.getMiddlewareHooks<NestifyInterceptor>(tokens, 'intercept'),
    resultWrapper: (_task, _i, _tasks, args) => args,
    breakCondition: () => false,
    skipCondition: () => false,
  });
}
