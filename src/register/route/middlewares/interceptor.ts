import { createSerialTask, Taskify } from '@/common/serial-task.js';
import lazyInjector from '@/register/lazy-injector.js';

/**
 * Create a preValidation hook for the route
 */
export function createInterceptor(tokens: InjectToken[]): Taskify<InterceptorTask> {
  return createSerialTask<InterceptorTask>({
    tasks: lazyInjector.getMiddlewareHooks<InjecoratorInterceptor>(tokens, 'intercept'),
    resultWrapper: (_task, _i, _tasks, args) => args,
    breakCondition: () => false,
    skipCondition: () => false,
  });
}
