import { InjecoratorPipe } from '@/types/middleware.js';
import { ExecutionContext } from '@/common/execution-context.class.js';
import { basicTransformer } from './basic-transformer.js';

export class PipeRaw implements InjecoratorPipe {
  async transform(context: ExecutionContext) {
    return await basicTransformer(context, 'raw');
  }
}
