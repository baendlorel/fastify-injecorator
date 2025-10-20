import { ForbiddenException } from '@/exceptions/index.js';
import { createSerialTask, Taskify } from '@/common/serial-task.js';
import lazyInjector from '@/register/lazy-injector.js';

/**
 * Create a preValidation hook for the route
 */
export function createGuard(tokens: InjectToken[]): Taskify<GuardTask> {
  const task = createSerialTask<GuardTask>({
    tasks: lazyInjector.getMiddlewareHooks<InjecoratorGuard>(tokens, 'canActivate'),
    resultWrapper: (_task, _i, _tasks, args) => args,
    breakCondition: (_task, _i, _tasks, _args, lastReturn) => lastReturn === false,
    skipCondition: () => false,
  });

  return async function (context: ExecutionContext) {
    // & Guards can return false or throw an error
    // If it throws, the error will be taken over by Filter(onError handler)
    const result = await task(context);
    if (result.value === false) {
      throw new ForbiddenException();
    }
    return result;
  };
}
