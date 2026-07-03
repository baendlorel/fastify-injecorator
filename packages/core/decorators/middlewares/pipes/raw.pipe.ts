import { InjecoratorPipe } from '@core/types/middleware.js';
import { ExecutionContext } from '@core/common/execution-context.js';
import { basicTransformer } from './basic-transformer.js';

export class PipeRaw implements InjecoratorPipe {
  async transform(context: ExecutionContext) {
    return await basicTransformer(context, 'raw');
  }
}
