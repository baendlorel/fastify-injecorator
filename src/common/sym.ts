// todo 考虑改成小写namespace

import { $define } from './native.js';

/**
 * Property keys used to store metadata.
 */
export class sym extends null {
  /**
   * Polyfill for stage2 proposal: Symbol.metadata.
   * - obj[Symbol.metadata] stores metadata for decorators.
   * @see https://github.com/tc39/proposal-decorator-metadata
   */
  static readonly metadata =
    typeof Symbol.metadata === 'undefined'
      ? ($define(Symbol, 'metadata', { value: Symbol.for('Symbol.metadata') }), Symbol.metadata)
      : Symbol.metadata;

  static readonly void = Symbol('void');

  static readonly root = Symbol('root');

  /**
   * Stores the `module` information.
   */
  static readonly module = Symbol('module');

  /**
   * Stores the `provider` information.
   */
  static readonly provider = Symbol('provider');

  /**
   * Stores the `controller` information.
   */
  static readonly controller = Symbol('controller');

  /**
   * Stores injection information for fields.
   * - This is used to inject dependencies into fields of a class.
   * - The value is an object with the dependency class and other metadata.
   */
  static readonly injection = Symbol('injection');

  /**
   * Stores route metadata
   */
  static readonly route = Symbol('route');

  /**
   * Stores basic route options with interface `RouteBasic`
   */
  static readonly routeBase = Symbol('routeBase');

  /**
   * Stores route options of `fastify.route(opts)`
   * - Priority: `opts.schema` < `Symbol(RouteApiSchema)` < `@Pipe({ schema })`
   */
  static readonly routeOpt = Symbol('routeOpt');

  /**
   * Stores info schema like `summary`, `description`, etc. for swagger
   * - Priority: `opts.schema` < `Symbol(RouteApiSchema)` < `@Pipe({ schema })`
   */
  static readonly routeApiSchema = Symbol('routeApiSchema');

  /**
   * Stores property paths of the handler argument `request: FastifyRequest`
   * - if the handler is decorated by `@Args('body.name','body.age')`, then the handler will be called as `handler(request.body.name, request.body.age, reply)`
   * - `reply` will always be the last argument
   */
  static readonly handlerArgs = Symbol('handlerArgs');

  /**
   * Identify this class as an interceptor
   */
  static readonly interceptor = Symbol('Interceptor');

  /**
   * Stores interceptors with controller level
   */
  static readonly controllerInterceptor = Symbol('ControllerInterceptor');

  /**
   * Stores interceptors with handler level
   */
  static readonly handlerInterceptor = Symbol('HandlerInterceptor');

  /**
   * Identify this class as a guard
   */
  static readonly guard = Symbol('Guard');

  /**
   * Stores guards with controller level
   */
  static readonly controllerGuard = Symbol('ControllerGuard');

  /**
   * Stores guards with handler level
   */
  static readonly handlerGuard = Symbol('HandlerGuard');

  /**
   * Identify this class as a filter
   */
  static readonly filter = Symbol('Filter');

  /**
   * Stores filters with controller level
   */
  static readonly controllerFilter = Symbol('ControllerFilter');

  /**
   * Stores filters with handler level
   */
  static readonly handlerFilter = Symbol('HandlerFilter');

  /**
   * Identify this class as a pipe
   */
  static readonly pipe = Symbol('Pipe');

  /**
   * Stores pipes with controller level
   */
  static readonly controllerPipe = Symbol('controllerPipe');

  /**
   * Stores pipes with handler level
   */
  static readonly handlerPipe = Symbol('handlerPipe');

  /**
   * Custom metadata stored in this field
   */
  static readonly custom = Symbol('custom');
}
