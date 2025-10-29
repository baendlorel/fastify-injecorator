import { Pipe } from '../../../src/decorators/middlewares/pipe.js';
import { ExecutionContext } from '../../../src/common/execution-context.js';
import { InjecoratorPipe, PipeFullSchema } from '../../../src/types/middleware.js';
import { BadRequestException } from '../../../src/exceptions/index.js';

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
