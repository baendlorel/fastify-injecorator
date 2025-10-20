import { FastifySchemaCompiler, FastifyValidationResult as Validator } from 'fastify/types/schema.js';
import { PipeSchema, PipeFullSchema } from '@/types/middleware.js';
import { whether } from '@/asserts/whether.js';

import { ExecutionContext } from '@/common/execution-context.class.js';
import { Sym } from '@/common/sym.js';
import { promiseTry } from '@/common/promise-try.js';
import { BadRequestException } from '@/exceptions/index.js';

type HttpPart = 'body' | 'params' | 'query' | 'ip' | 'raw';

type Compiler = FastifySchemaCompiler<PipeSchema>;

type ValidatorReturn = boolean | { value?: unknown; error?: Error };

class BasicTransformer {
  private validatorCompiler: Compiler | null = null;
  private readonly schemaMap = new Map<PipeSchema, Validator>();

  private getValidator(compiler: Compiler | undefined, schema?: PipeSchema): Validator | null {
    if (this.validatorCompiler === null) {
      this.validatorCompiler = typeof compiler === 'function' ? compiler : null;
    }

    if (this.validatorCompiler === null) {
      return null; // No fastify schema compiler provided
    }

    if (schema === undefined) {
      return null; // No schema provided
    }

    // & Now compiler and schema are both well defined
    if (this.schemaMap.has(schema)) {
      return this.schemaMap.get(schema) as Validator;
    }

    const newValidator = Reflect.apply(this.validatorCompiler, null, [{ schema }]) as Validator;
    this.schemaMap.set(schema, newValidator);
    return newValidator;
  }

  private handleResult(validator: Validator, result: ValidatorReturn) {
    if (result === true) {
      return Sym.void; // Validation passed
    }

    if (validator.errors && validator.errors.length > 0) {
      throw new BadRequestException(validator.errors.map((e) => e.message).join(', '));
    }

    if (result === false) {
      throw new BadRequestException('Validation failed');
    }

    if (result.error instanceof Error) {
      throw new BadRequestException(result.error.message);
    }

    if ('value' in result) {
      return result.value;
    }

    return Sym.void; // Validation passed
  }

  private getNeededSchema(httpPart: HttpPart, schema?: PipeFullSchema) {
    if (schema === undefined) {
      return undefined;
    }
    if (whether.isObject<PipeFullSchema>(schema)) {
      switch (httpPart) {
        case 'body':
          return 'body' in schema ? schema.body : undefined;
        case 'params':
          return 'params' in schema ? schema.params : undefined;
        case 'query':
          return 'querystring' in schema ? schema.querystring : undefined;
        case 'ip':
        case 'raw':
        default:
          return undefined;
      }
    }
  }

  private async main(context: ExecutionContext, httpPart: HttpPart, schema?: PipeFullSchema) {
    const request = context.switchToHttp().getRequest();
    const data = request[httpPart];
    const args = [data, context.switchToHttp().getReply()];
    const neededSchema = this.getNeededSchema(httpPart, schema);

    const validator = this.getValidator(request.server.validatorCompiler, neededSchema);
    if (!validator) {
      return args;
    }

    const rawResult = await promiseTry(validator, null, data);
    const result = this.handleResult(validator, rawResult);
    if (result !== Sym.void) {
      args[0] = result; // Update the first argument with the validated data
    }
    return args;
  }

  get transformer(): typeof this.main {
    return (...args) => this.main.apply(this, args);
  }
}

export const basicTransformer = new BasicTransformer().transformer;
