import type { ExecutionContext, InjecoratorPipe } from '@nestify/core';
import { Pipe } from '@nestify/core';
import { basicTransformer } from './basic-transformer.js';

@Pipe()
export class PipeRaw implements InjecoratorPipe {
  async transform(context: ExecutionContext) {
    return await basicTransformer(context, 'raw');
  }
}
