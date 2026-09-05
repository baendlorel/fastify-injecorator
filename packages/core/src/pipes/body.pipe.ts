import type { NestifyPipe, PipeFullSchema } from '@core/types/middleware.js';
import type { ExecutionContext } from '@core/common/execution-context.js';
import { _PipeSet } from '@core/decorators/middlewares/pipe.js';
import { basicTransformer } from './basic-transformer.js';

class PipeBody implements NestifyPipe {
  async transform(context: ExecutionContext, _input?: any[], schema?: PipeFullSchema): Promise<any[]> {
    return basicTransformer(context, 'body', schema);
  }
}

_PipeSet(PipeBody);

export { PipeBody };
