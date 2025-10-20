import { createSerialTaskAsync, TaskifyAsync } from 'serial-task';
import { InjectToken } from '@/types/injecorator.js';
import { InterceptorTask, InjecoratorInterceptor } from '@/types/middleware.js';
import lazyInjector from '@/register/lazy-injector.js';

/**
 * Create a preValidation hook for the route
 */
export function createInterceptor(tokens: InjectToken[]): TaskifyAsync<InterceptorTask> {
  return createSerialTaskAsync<InterceptorTask>({
    tasks: lazyInjector.getMiddlewareHooks<InjecoratorInterceptor>(tokens, 'intercept'),
    resultWrapper: (_task, _i, _tasks, args) => args,
    breakCondition: () => false,
    skipCondition: () => false,
  });
}
