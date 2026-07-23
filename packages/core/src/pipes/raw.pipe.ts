import type { InjecoratorPipe } from '@core/types/middleware.js';
import type { ExecutionContext } from '@core/common/execution-context.js';
import { Pipe } from '@core/decorators/middlewares/pipe.js';
import { basicTransformer } from './basic-transformer.js';

@Pipe()
export class PipeRaw implements InjecoratorPipe {
  async transform(context: ExecutionContext) {
    return await basicTransformer(context, 'raw');
  }
}
