/**
 * Property keys used to store metadata.
 */
export class Sym extends null {
  /**
   * Polyfill for stage2 proposal: Symbol.metadata.
   * - obj[Symbol.metadata] stores metadata for decorators.
   * @see https://github.com/tc39/proposal-decorator-metadata
   */
  static readonly metadata =
    typeof Symbol.metadata === 'undefined'
      ? (Object.defineProperty(Symbol, 'metadata', { value: Symbol.for('Symbol.metadata') }), Symbol.metadata)
      : Symbol.metadata;

  static readonly Root = Symbol('Injectorator');

  /**
   * Means argument is not provided
   * - sometimes it might look like `Sym.Void`
   */
  static readonly NotProvided = Symbol('NotProvided');

  /**
   * Provide the given value when `target` is `Sym.NotProvided`
   * @param target unknown value
   * @param defaultValue return this when `target` is `Sym.NotProvided`
   * @param value return this when `target` is not omitted
   */
  static provide(target: unknown, defaultValue: unknown, value: unknown = Sym.NotProvided) {
    if (target === Sym.NotProvided) {
      return defaultValue;
    }
    return value === Sym.NotProvided ? target : value;
  }

  /**
   * Means argument is not initialized
   */
  static readonly Uninitialized = Symbol('Uninitialized');

  /**
   * Means the function returns void
   * - sometimes it might look like `Sym.NotProvided`
   */
  static readonly Void = Symbol('Void');

  /**
   * Global configurations stored here
   * - access by global[Sym.GlobalOptions]
   */
  static readonly GlobalOptions = Symbol('GlobalOptions');

  /**
   * Stores modules that are registered with `isGlobal: true`.
   */
  static readonly GlobalModules = Symbol('GlobalModules');

  /**
   * Stores the `module` information.
   */
  static readonly Module = Symbol('Module');

  /**
   * Stores the `provider` information.
   */
  static readonly Provider = Symbol('Provider');

  /**
   * Stores the `controller` information.
   */
  static readonly Controller = Symbol('Controller');

  /**
   * Stores injection information for fields.
   * - This is used to inject dependencies into fields of a class.
   * - The value is an object with the dependency class and other metadata.
   */
  static readonly Injection = Symbol('Injection');

  /**
   * Stores route metadata
   */
  static readonly Route = Symbol('Route');

  /**
   * Stores basic route options with interface `RouteBasic`
   */
  static readonly RouteBasic = Symbol('RouteBasic');

  /**
   * Stores route options of `fastify.route(opts)`
   * - Priority: `opts.schema` < `Symbol(RouteApiSchema)` < `@Pipe({ schema })`
   */
  static readonly RouteOpt = Symbol('RouteOpt');

  /**
   * Stores info schema like `summary`, `description`, etc. for swagger
   * - Priority: `opts.schema` < `Symbol(RouteApiSchema)` < `@Pipe({ schema })`
   */
  static readonly RouteApiSchema = Symbol('RouteApiSchema');

  /**
   * Stores property paths of the handler argument `request: FastifyRequest`
   * - if the handler is decorated by `@Args('body.name','body.age')`, then the handler will be called as `handler(request.body.name, request.body.age, reply)`
   * - `reply` will always be the last argument
   */
  static readonly HandlerArgs = Symbol('HandlerArgs');

  /**
   * Identify this class as an interceptor
   */
  static readonly Interceptor = Symbol('Interceptor');

  /**
   * Stores interceptors with controller level
   */
  static readonly ControllerInterceptor = Symbol('ControllerInterceptor');

  /**
   * Stores interceptors with handler level
   */
  static readonly HandlerInterceptor = Symbol('HandlerInterceptor');

  /**
   * Identify this class as a guard
   */
  static readonly Guard = Symbol('Guard');

  /**
   * Stores guards with controller level
   */
  static readonly ControllerGuard = Symbol('ControllerGuard');

  /**
   * Stores guards with handler level
   */
  static readonly HandlerGuard = Symbol('HandlerGuard');

  /**
   * Identify this class as a filter
   */
  static readonly Filter = Symbol('Filter');

  /**
   * Stores filters with controller level
   */
  static readonly ControllerFilter = Symbol('ControllerFilter');

  /**
   * Stores filters with handler level
   */
  static readonly HandlerFilter = Symbol('HandlerFilter');

  /**
   * Identify this class as a pipe
   */
  static readonly Pipe = Symbol('Pipe');

  /**
   * Stores pipes with controller level
   */
  static readonly ControllerPipe = Symbol('ControllerPipe');

  /**
   * Stores pipes with handler level
   */
  static readonly HandlerPipe = Symbol('HandlerPipe');

  /**
   * Custom metadata stored in this field
   */
  static readonly Custom = Symbol('Custom');
}
