/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Get middlewares for a class method
 * - will concat middlewares of global/controller/method level
 * @param classMethod method from the class
 * @returns middleware array
 */
type MiddlewareGetter<T = InjectToken> = (field: Key) => T[];
type GuardGetter = MiddlewareGetter;
type InterceptorGetter = MiddlewareGetter;
type PipeGetter = MiddlewareGetter<PipeOptions>;
type FilterGetter = MiddlewareGetter;

/**
 * `PipeSchema` is equivalent to FastifySchema.body/params/query...
 */
type PipeSchema = unknown;

interface PipeFullSchema {
  body?: PipeSchema;
  querystring?: PipeSchema;
  params?: PipeSchema;
  headers?: PipeSchema;
  response?: PipeSchema;
}

type RouteApiSchema = Omit<FastifySchema, keyof PipeFullSchema>;

interface PipeOptions {
  /**
   * Validation schema
   * - if pipe class is not given, will try to use global pipe
   *   - will be ignored when global pipe is not set
   */
  schema?: PipeFullSchema;

  /**
   * Pipe class
   * - if `inputPath` is not given, pipe transformer will take the whole `request`
   */
  pipe: Key | Class<InjecoratorPipe>;
}

interface InjecoratorGuard {
  /**
   * Guard
   * - you can use `throw` when guard fails
   * - will stop and reply if any guard returns `false` or throws an error
   * @param context like in NestJS, it can `.switchToHttp()` and get `request` and `reply` object
   * - if `previousReturn` is `undefined`, it will be ignored.
   */
  canActivate: (context: ExecutionContext) => OrPromise | OrPromise<boolean>;
}

interface InjecoratorInterceptor {
  /**
   * Called when entering the controller method
   * @param context like in NestJS, it can `.switchToHttp()` and get `request` and `reply` object
   * @returns returned function will be called when leaving the controller method
   */
  intercept: (context: ExecutionContext) => OrPromise | OrPromise<Func>;
}

type PipeTransformerArgs = [] | [any[]] | [any[], PipeFullSchema];
interface InjecoratorPipe {
  /**
   * Like transform in NestJS Pipe, validation and transformation are done here
   * @param context like in NestJS, it can `.switchToHttp()` and get `request` and `reply` object
   * @param input comes from last pipe or the request object
   * @param schema validation schema, if provided in the pipe options
   * @returns returned value will be passed to the next pipe or as the `input` argument
   */
  transform: (
    context: ExecutionContext,
    input?: any[],
    schema?: PipeFullSchema
  ) => OrPromise<any[]>;
}

interface InjecoratorFilter {
  /**
   * @param context like in NestJS, it can `.switchToHttp()` and get `request` and `reply` object
   * @param exception catched exception
   */
  catch: (context: ExecutionContext, exception: unknown) => OrPromise;
}

type InjecoratorMiddleware =
  | InjecoratorInterceptor
  | InjecoratorGuard
  | InjecoratorFilter
  | InjecoratorPipe;

// & Middleware tasks
type GuardTask = InjecoratorGuard['canActivate'];
type PipeTask = InjecoratorPipe['transform'];
type InterceptorTask = InjecoratorInterceptor['intercept'];
type FilterTask = InjecoratorFilter['catch'];
