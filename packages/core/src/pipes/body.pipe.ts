import type { InjecoratorPipe, PipeFullSchema } from '@core/types/middleware.js';
import type { ExecutionContext } from '@core/common/execution-context.js';
import { Pipe } from '@core/decorators/middlewares/pipe.js';
import { basicTransformer } from './basic-transformer.js';

@Pipe()
export class PipeBody implements InjecoratorPipe {
  async transform(context: ExecutionContext, _input?: any[], schema?: PipeFullSchema): Promise<any[]> {
    return basicTransformer(context, 'body', schema);
  }
}
