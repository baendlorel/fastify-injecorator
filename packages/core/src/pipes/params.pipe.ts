import type { ExecutionContext } from '@core/common/execution-context.js';
import { NestifyPipe, type PipeFullSchema } from '@core/types/middleware.js';
import { _PipeSet } from '@core/decorators/middlewares/pipe.js';
import { basicTransformer } from './basic-transformer.js';

class PipeParams extends NestifyPipe {
  async transform(context: ExecutionContext, _input?: any[], schema?: PipeFullSchema) {
    return basicTransformer(context, 'params', schema);
  }
}

_PipeSet(PipeParams);
export { PipeParams };
