import { expect, whether } from '@/asserts/index.js';
import { createSerialTask, Taskify } from '@/common/serial-task.js';
import lazyInjector from '@/register/lazy-injector.js';
import meta from '@/register/meta.js';

const defaultFilter: Taskify<FilterTask> = async (context, exception) => {
  const http = context.switchToHttp();
  const reply = http.getReply();
  const message = whether.isError(exception) ? exception.message : String(exception);
  reply.log.error(`${http.getRequest().url} - ${message}`);

  reply.status(400).send({
    error: 'Bad Request',
    message,
    details: exception,
  });

  return {
    value: undefined,
    results: [],
    trivial: true,
  };
};

export function createFilter(tokens: InjectToken[]): Taskify<FilterTask> {
  const catches = tokens.map((token) => {
    const { cls } = lazyInjector.getDetail<InjecoratorFilter>(token);
    expect.isClass(
      cls,
      `Filter token '${String(token)}' must refer to a class, but got ${String(cls)}`
    );

    const exceptionClasses = meta.getFilters(cls) ?? [];
    expect.isArray(exceptionClasses, (c) =>
      expect.isClass(c, `Filter token expected to be a class, but got ${String(c)}`)
    );
    return exceptionClasses;
  });

  if (tokens.length === 0) {
    return defaultFilter;
  }

  return createSerialTask<FilterTask>({
    tasks: lazyInjector.getMiddlewareHooks<InjecoratorFilter>(tokens, 'catch'),
    resultWrapper: (_task, _i, _tasks, args) => args,
    breakCondition: () => false,
    skipCondition: (_task, i, _tasks, args) => catches[i].some((cls) => args[1] instanceof cls),
  });
}
