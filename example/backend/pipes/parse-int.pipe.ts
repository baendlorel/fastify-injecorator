import { Pipe } from '../../../packages/core/src/decorators/middlewares/pipe.js';
import { ExecutionContext } from '../../../packages/core/src/common/execution-context.js';
import { NestifyPipe, PipeFullSchema } from '../../../packages/core/src/types/middleware.js';
import { BadRequestException } from '../../../packages/core/src/exceptions/index.js';

@Pipe()
export class ParseIntPipe implements NestifyPipe {
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
