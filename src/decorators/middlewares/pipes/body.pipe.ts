import '@/common/promise.js';
import { basicTransformer } from './basic-transformer.js';

export class PipeBody implements InjecoratorPipe {
  transform(context: ExecutionContext, input?: any[], schema?: PipeFullSchema): OrPromise<any[]>;
  async transform(context: ExecutionContext, ...args: PipeTransformerArgs) {
    if (args.length === 2) {
      return await basicTransformer(context, 'body', args[1]);
    } else {
      return await basicTransformer(context, 'body');
    }
  }
}
