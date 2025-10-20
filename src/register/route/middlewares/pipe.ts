import { Sym } from '@/common/sym.js';
import { createSerialTask, Taskify } from '@/common/serial-task.js';
import lazyInjector from '@/register/lazy-injector.js';

export function createPipe(pipeOpts: PipeOptions[]): Taskify<PipeTask> {
  const tokens: InjectToken[] = [];
  const schemas: (PipeFullSchema | typeof Sym.NotProvided)[] = [];

  for (let i = 0; i < pipeOpts.length; i++) {
    const { pipe, schema = Sym.NotProvided } = pipeOpts[i];
    tokens.push(pipe as InjectToken);
    schemas.push(schema);
  }

  return createSerialTask<PipeTask>({
    tasks: lazyInjector.getMiddlewareHooks<InjecoratorPipe>(tokens, 'transform'),
    resultWrapper: (_task, i, _tasks, args) => {
      if (schemas[i] === Sym.NotProvided) {
        args.splice(2);
      } else {
        args[2] = schemas[i];
      }
      return args;
    },
    breakCondition: () => false,
    skipCondition: () => false,
  });
}
