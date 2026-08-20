import type { OrPromise } from '@nestify-js/shared';
import type { InjecoratorPipe, PipeFullSchema, PipeTransformerArgs } from '@core/types/middleware.js';
import type { ExecutionContext } from '@core/common/execution-context.js';
import { Pipe } from '@core/decorators/middlewares/pipe.js';
import { basicTransformer } from './basic-transformer.js';

@Pipe()
export class PipeQuery implements InjecoratorPipe {
  transform(context: ExecutionContext, input?: any[], schema?: PipeFullSchema): OrPromise<any[]>;
  async transform(context: ExecutionContext, ...args: PipeTransformerArgs) {
    if (args.length === 2) {
      return await basicTransformer(context, 'query', args[1]);
    } else {
      return await basicTransformer(context, 'query');
    }
  }
}
