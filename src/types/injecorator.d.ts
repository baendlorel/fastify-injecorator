/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyRequest } from 'fastify';

export interface BaseHttpException {
  readonly message: string;
  readonly statusCode: HttpStatus;
  readonly error: string;
  getResponse(): {
    statusCode: HttpStatus;
    error: string;
    message: string;
  };
}

export type DataKeys<T> = {
  [K in keyof T]: T[K] extends Func ? never : K;
}[keyof T];

export type FastifyRequestDataKeys = Exclude<DataKeys<FastifyRequest>, undefined>;

export type ArgExtractionPath = FastifyRequestDataKeys | `${FastifyRequestDataKeys}.${string}`;

export type InjectToken = Key | Class;

export type InjectArg = InjectToken | (() => Class);

export interface ProviderFactoryOptions {
  /**
   * The unique token used to identify and inject this provider.
   */
  provide: Key;

  /**
   * Provide via factory function.
   * - If `inject` is provided, it will be injected into the factory function.
   *   - When `inject` = `[MyClass1, 'token1']`, the factory will be called as `useFactory(myClass1, instanceOfToken1)`.
   */
  useFactory: (...instances: Instance[]) => Instance;

  inject?: (Class | Key)[];
}

export type ProviderStandardOptions =
  | ProviderFactoryOptions
  | {
      /**
       * The unique token used to identify and inject this provider.
       */
      provide: Key;

      /**
       * Directly provide a value. No dependency injection is performed.
       * If dependencies are needed, the factory must inject them manually.
       */
      useValue: Instance;
    }
  | {
      /**
       * The unique token used to identify and inject this provider.
       */
      provide: Key;

      /**
       * Provide via class. Managed by Injecorator, dependencies are automatically injected.
       */
      useClass: Class;
    }
  | {
      /**
       * The unique token used to identify and inject this provider.
       */
      provide: Key;

      /**
       * Provide by referencing an existing provider. No chain lookup; only the referenced provider is used.
       */
      useExisting: Key;
    };

export type ProviderOptions = ProviderStandardOptions | Class;

export interface DynamicModule {
  moduleClass: Class;

  /**
   * When "true", makes a module global-scoped.
   *
   * Once imported into any module, a global-scoped module will be visible
   * in all modules. Thereafter, modules that wish to inject a service exported
   * from a global module do not need to import the provider module.
   *
   * @default false
   */
  isGlobal?: boolean;
}

export interface FastifyInjecoratorOptions {
  rootModule: Class;

  /**
   * Injecorator naturally allows circular references, but:
   * - Providers declared in the same module are allowed by default
   * - **Must set to `true`** to allow cross-module circular dependencies
   * @default false
   */
  allowCrossModuleCircularReference: boolean;
}

export interface LazyInjectEntry {
  provide: Key;
  propertyKey: Key;
  dependency: InjectArg;
}

export interface InjectMetadata {
  /**
   * When using `@Inject(token)` to decorate a class field
   *
   * `token` is stored there
   */
  dependency: InjectArg;
}

export interface ControllerMetadata {
  prefix: string[];
}

export interface ProviderMetadata {
  /**
   * !Not supported yet
   * @todo
   */
  args: any[];
}

export interface ModuleMetadata {
  /**
   * Services provided by this module
   */
  readonly providers: ProviderOptions[];

  /**
   * Controllers declared in this module
   */
  readonly controllers: Class[];

  /**
   * ! Only modules can be imported. After importing, providers in this module can import services from other modules.
   *
   * Import other modules
   * - Must be classes decorated with `@Module`
   */
  readonly imports: (Class | DynamicModule)[];

  /**
   * ! Controllers cannot be exported
   *
   * Export services to other modules
   * - These are classes decorated with `@Injectable`
   */
  readonly exports: Class[];

  /**
   * Prefix applied to each controller
   * - will inherit from the parent module
   */
  readonly prefix: string;

  get accessibleProviderTokens(): Key[];

  readonly outer: boolean;
}

export interface InheritedModuleMetadata {
  readonly prefix: string[];
}
