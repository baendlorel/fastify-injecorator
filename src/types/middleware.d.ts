/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Get middlewares for a class method
 * - will concat middlewares of global/controller/method level
 * @param classMethod method from the class
 * @returns middleware array
 */
export type MiddlewareGetter<T = InjectToken> = (field: Key) => T[];
export type GuardGetter = MiddlewareGetter;
export type InterceptorGetter = MiddlewareGetter;
export type PipeGetter = MiddlewareGetter<PipeOptions>;
export type FilterGetter = MiddlewareGetter;

/**
 * `PipeSchema` is equivalent to FastifySchema.body/params/query...
 */
export type PipeSchema = unknown;

export interface PipeFullSchema {
  body?: PipeSchema;
  querystring?: PipeSchema;
  params?: PipeSchema;
  headers?: PipeSchema;
  response?: PipeSchema;
}

export type RouteApiSchema = Omit<FastifySchema, keyof PipeFullSchema>;

export interface PipeOptions {
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

export interface InjecoratorGuard {
  /**
   * Guard
   * - you can use `throw` when guard fails
   * - will stop and reply if any guard returns `false` or throws an error
   * @param context like in NestJS, it can `.switchToHttp()` and get `request` and `reply` object
   * - if `previousReturn` is `undefined`, it will be ignored.
   */
  canActivate: (context: ExecutionContext) => OrPromise | OrPromise<boolean>;
}

export interface InjecoratorInterceptor {
  /**
   * Called when entering the controller method
   * @param context like in NestJS, it can `.switchToHttp()` and get `request` and `reply` object
   * @returns returned function will be called when leaving the controller method
   */
  intercept: (context: ExecutionContext) => OrPromise | OrPromise<Func>;
}

export type PipeTransformerArgs = [] | [any[]] | [any[], PipeFullSchema];
export interface InjecoratorPipe {
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

export interface InjecoratorFilter {
  /**
   * @param context like in NestJS, it can `.switchToHttp()` and get `request` and `reply` object
   * @param exception catched exception
   */
  catch: (context: ExecutionContext, exception: unknown) => OrPromise;
}

export type InjecoratorMiddleware =
  | InjecoratorInterceptor
  | InjecoratorGuard
  | InjecoratorFilter
  | InjecoratorPipe;

// & Middleware tasks
export type GuardTask = InjecoratorGuard['canActivate'];
export type PipeTask = InjecoratorPipe['transform'];
export type InterceptorTask = InjecoratorInterceptor['intercept'];
export type FilterTask = InjecoratorFilter['catch'];
