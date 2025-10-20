import '@/common/promise.js';
import { basicTransformer } from './basic-transformer.js';

export class PipeRaw implements InjecoratorPipe {
  async transform(context: ExecutionContext) {
    return await basicTransformer(context, 'raw');
  }
}
