import { createSerialTaskAsync, TaskifyAsync } from 'serial-task';
import { GuardTask, InjecoratorGuard } from '@/types/middleware.js';
import { InjectToken } from '@/types/injecorator.js';

import { ForbiddenException } from '@/exceptions/index.js';
import lazyInjector from '@/register/lazy-injector.js';
import { ExecutionContext } from '@/common/execution-context.class.js';

/**
 * Create a preValidation hook for the route
 */
export function createGuard(tokens: InjectToken[]): TaskifyAsync<GuardTask> {
  const task = createSerialTaskAsync<GuardTask>({
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
