import type { InjectToken } from '@core/types/injecorator.js';
import type { FilterTask, InjecoratorFilter } from '@core/types/middleware.js';

import { createSerialTaskAsync, TaskifyAsync } from 'serial-task';
import { expectArray, expectClass } from '@core/asserts/index.js';
import { injector } from '@core/register/lazy-injector.js';
import { metaGetFilters } from '@core/register/meta.js';

const defaultFilter: TaskifyAsync<FilterTask> = async (context, exception) => {
  const http = context.switchToHttp();
  const reply = http.getReply();
  const message = (exception as Error)?.message ?? String(exception);
  // reply.log.error(`${http.getRequest().url} - ${message}`);

  reply.status(400).send({
    error: 'Bad Request',
    message,
    details: exception,
  });

  return {
    value: undefined,
    results: [],
    trivial: true,
    breakAt: -1,
    skipped: [],
  };
};

export function createFilter(tokens: InjectToken[]): TaskifyAsync<FilterTask> {
  const catches = tokens.map((token) => {
    const { cls } = injector.getDetail<InjecoratorFilter>(token);
    expectClass(cls, `Filter token '${String(token)}' must refer to a class, but got ${String(cls)}`);

    const exceptionClasses = metaGetFilters(cls) ?? [];
    expectArray(exceptionClasses, 'exceptions classes must be an array', (c) =>
      expectClass(c, `Filter token expected to be a class, but got ${String(c)}`),
    );
    return exceptionClasses;
  });

  if (tokens.length === 0) {
    return defaultFilter;
  }

  return createSerialTaskAsync<FilterTask>({
    tasks: injector.getMiddlewareHooks<InjecoratorFilter>(tokens, 'catch'),
    resultWrapper: (_task, _i, _tasks, args) => args,
    breakCondition: () => false,
    skipCondition: (_task, i, _tasks, args) => catches[i].some((cls) => args[1] instanceof cls),
  });
}
