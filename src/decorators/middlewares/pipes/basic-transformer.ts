import { PipeSchema, PipeFullSchema } from '@/types/middleware.js';
import { whether } from '@/asserts/whether.js';
import { ExecutionContext } from '@/common/execution-context.class.js';
import { Sym } from '@/common/sym.js';
import { BadRequestException } from '@/exceptions/index.js';
import { FastifySchemaCompiler, FastifyValidationResult as Validator } from 'fastify/types/schema.js';

type HttpPart = 'body' | 'params' | 'query' | 'ip' | 'raw';

type Compiler = FastifySchemaCompiler<PipeSchema>;

type MaybeCompiler = Compiler | typeof Sym.NotProvided | typeof Sym.Uninitialized;

type ValidatorReturn = boolean | { value?: unknown; error?: Error };

class BasicTransformer {
  private validatorCompiler: MaybeCompiler = Sym.Uninitialized;
  private readonly schemaMap = new Map<PipeSchema, Validator>();

  private getValidator(compiler: Compiler | undefined, schema: PipeSchema): Validator | null {
    if (this.validatorCompiler === Sym.Uninitialized) {
      this.validatorCompiler = typeof compiler === 'function' ? compiler : Sym.NotProvided;
    }

    if (this.validatorCompiler === Sym.NotProvided) {
      return null; // No fastify schema compiler provided
    }

    if (schema === Sym.NotProvided) {
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
      return Sym.Void; // Validation passed
    }

    if (validator.errors && validator.errors.length > 0) {
      throw new BadRequestException(validator.errors.map((e) => e.message).join(', '));
    }

    if (result === false) {
      throw new BadRequestException('Validation failed');
    }

    const { value = Sym.NotProvided, error = Sym.NotProvided } = result;
    if (error instanceof Error) {
      throw new BadRequestException(error.message);
    }

    if (value !== Sym.NotProvided) {
      return value;
    }

    return Sym.Void; // Validation passed
  }

  private getNeededSchema(httpPart: HttpPart, schema: PipeFullSchema | typeof Sym.NotProvided) {
    if (schema === Sym.NotProvided) {
      return Sym.NotProvided;
    }
    if (whether.isObject<PipeFullSchema>(schema)) {
      switch (httpPart) {
        case 'body':
          return 'body' in schema ? schema.body : Sym.NotProvided;
        case 'params':
          return 'params' in schema ? schema.params : Sym.NotProvided;
        case 'query':
          return 'querystring' in schema ? schema.querystring : Sym.NotProvided;
        case 'ip':
        case 'raw':
        default:
          return Sym.NotProvided;
      }
    }
  }

  private async main(
    context: ExecutionContext,
    httpPart: HttpPart,
    schema: PipeFullSchema | typeof Sym.NotProvided = Sym.NotProvided
  ) {
    const request = context.switchToHttp().getRequest();
    const data = request[httpPart];
    const args = [data, context.switchToHttp().getReply()];
    const neededSchema = this.getNeededSchema(httpPart, schema);

    const validator = this.getValidator(request.server.validatorCompiler, neededSchema);
    if (!validator) {
      return args;
    }

    const rawResult = await Promise.try(validator, null, data);
    const result = this.handleResult(validator, rawResult);
    if (result !== Sym.Void) {
      args[0] = result; // Update the first argument with the validated data
    }
    return args;
  }

  get transformer() {
    return this.main.bind(this);
  }
}

export const basicTransformer = new BasicTransformer().transformer;
