import type { OrPromise } from '@nestify/shared';
import type { ExecutionContext, InjecoratorPipe, PipeFullSchema, PipeTransformerArgs } from '@nestify/core';
import { Pipe } from '@nestify/core';
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
