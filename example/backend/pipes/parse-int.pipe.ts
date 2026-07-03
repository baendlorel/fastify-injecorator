import { Pipe } from '../../../packages/core/decorators/middlewares/pipe.js';
import { ExecutionContext } from '../../../packages/core/common/execution-context.js';
import { InjecoratorPipe, PipeFullSchema } from '../../../packages/core/types/middleware.js';
import { BadRequestException } from '../../../packages/core/exceptions/index.js';

@Pipe()
export class ParseIntPipe implements InjecoratorPipe {
  async transform(context: ExecutionContext, input?: any[], schema?: PipeFullSchema): Promise<any[]> {
    if (!input || input.length === 0) {
      return input || [];
    }

    // Transform first argument
    const value = input[0];
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(`Validation failed: "${value}" is not an integer`);
    }

    return [val, ...input.slice(1)];
  }
}
