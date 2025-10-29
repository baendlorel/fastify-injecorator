import { Pipe } from '../../../src/decorators/middlewares/pipe.js';
import { ExecutionContext } from '../../../src/common/execution-context.js';
import { InjecoratorPipe, PipeFullSchema } from '../../../src/types/middleware.js';
import { BadRequestException } from '../../../src/exceptions/index.js';

@Pipe()
export class ValidationPipe implements InjecoratorPipe {
  async transform(context: ExecutionContext, input?: any[], schema?: PipeFullSchema): Promise<any[]> {
    // Simple validation: check if object has required fields
    if (schema && input && input.length > 0) {
      const value = input[0];
      const bodySchema = schema.body as { required?: string[] };

      if (bodySchema?.required && Array.isArray(bodySchema.required)) {
        for (const field of bodySchema.required) {
          if (value[field] === undefined || value[field] === null || value[field] === '') {
            throw new BadRequestException(`Field '${field}' is required`);
          }
        }
      }
    }

    return input || [];
  }
}
