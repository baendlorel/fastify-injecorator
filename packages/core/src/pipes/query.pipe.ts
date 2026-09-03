import { type OrPromise } from '@nestify-js/shared';
import type { InjecoratorPipe, PipeFullSchema, PipeTransformerArgs } from '@core/types/middleware.js';
import type { ExecutionContext } from '@core/common/execution-context.js';
import { Pipe } from '@core/decorators/middlewares/pipe.js';
import { basicTransformer } from './basic-transformer.js';

@Pipe()
export class PipeQuery implements InjecoratorPipe {
  async transform(context: ExecutionContext, _input?: any[], schema?: PipeFullSchema) {
    return basicTransformer(context, 'query', schema);
  }
}
