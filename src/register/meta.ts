import { ReflectDeep } from 'reflect-deep';
import { concatArr } from 'concat-arr';
import {
  ProviderMetadata,
  ControllerMetadata,
  InjectArg,
  InjectMetadata,
  ModuleMetadata,
  DynamicModule,
  ProviderOptions,
  InjectToken,
} from '@/types/injecorator.js';
import {
  RouteApiSchema,
  InterceptorGetter,
  GuardGetter,
  FilterGetter,
  PipeOptions,
  PipeGetter,
  PipeFullSchema,
} from '@/types/middleware.js';

import { Sym } from '@/common/index.js';
import { splitPath, toModuleClass } from '@/common/utils.js';
import { RouteBasic, RouteConfig, RouteOptType } from '@/types/index.js';
import collection from './collection.js';
import provider from './provider.js';

/**
 * ! Methods here should be used **AFTER** validation of parameters
 */
class Meta {
  private set<T = unknown>(context: DecoratorContext, keys: Key[], value: T) {
    return ReflectDeep.set<T>(context.metadata, [Sym.Root, ...keys], value);
  }

  private get<T = unknown>(cls: Class, keys: Key[]) {
    return ReflectDeep.get<T>(cls, [Sym.metadata, Sym.Root, ...keys]);
  }

  setController(context: ClassDecoratorContext, prefix?: string): boolean {
    const data: ProviderMetadata = { args: [] };
    const controlled: ControllerMetadata = { prefix: splitPath(prefix) };
    return this.set(context, [Sym.Provider], data) && this.set(context, [Sym.Controller], controlled);
  }

  getController(cls: Class): ControllerMetadata {
    return this.get(cls, [Sym.Controller]) as ControllerMetadata;
  }

  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Route][context.name][Sym.RouteBasic]`
   */
  setRoute(context: ClassMethodDecoratorContext, httpMethod: string, route?: string): boolean {
    const basic: RouteBasic = {
      method: httpMethod,
      route: splitPath(route),
      field: context.name,
    };
    return this.set(context, [Sym.Route, context.name, Sym.RouteBasic], basic);
  }

  getRoute(cls: Class): Record<Key, RouteConfig> {
    return this.get(cls, [Sym.Route]) as Record<Key, RouteConfig>;
  }

  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Route][context.name][Sym.RouteOpt]`
   */
  setOpt(context: ClassMethodDecoratorContext, opts: RouteOptType): boolean {
    return this.set(context, [Sym.Route, context.name, Sym.RouteOpt], opts);
  }

  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Route][context.name][Sym.RouteSchema]`
   */
  setSchema(context: ClassMethodDecoratorContext, schema: RouteApiSchema): boolean {
    return this.set(context, [Sym.Route, context.name, Sym.RouteApiSchema], schema);
  }

  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Route][context.name][Sym.HandlerArgs]`
   */
  setHandlerArgs(context: ClassMethodDecoratorContext, propertyPaths: string[][]) {
    return this.set(context, [Sym.Route, context.name, Sym.HandlerArgs], propertyPaths);
  }

  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Inject][context.name]`
   */
  setInject(context: ClassFieldDecoratorContext, dependency: InjectArg): boolean {
    const o: InjectMetadata = {
      dependency,
    };
    return this.set(context, [Sym.Injection, context.name], o);
  }

  getInject(cls: Class): Record<Key, InjectMetadata> | undefined {
    return this.get<Record<Key, InjectMetadata>>(cls, [Sym.Injection]);
  }

  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Provider]`
   */
  setProvider(context: ClassDecoratorContext, args: unknown[] = []): boolean {
    const data: ProviderMetadata = { args };
    return this.set(context, [Sym.Provider], data);
  }

  /**
   * Directly set metadata on a class, used for `toModule(...)`
   *
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Provider]`
   */
  setProviderOnClass(target: Class, args: unknown[] = []): boolean {
    const data: ProviderMetadata = { args };
    return ReflectDeep.set(target, [Sym.metadata, Sym.Root, Sym.Provider], data);
  }

  getProvider(cls: Class): ProviderMetadata {
    return this.get(cls, [Sym.Provider]) as ProviderMetadata;
  }

  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Provider]`
   * - Will deduplicate each array automatically
   *
   * **normalize in the set method but not in get, makes it easier to detect bugs**
   * - some errors might be hidden when returning empty normalized metadata in get.
   */
  setModule(context: ClassDecoratorContext, options: Partial<ModuleMetadata>): boolean {
    const { controllers = [], providers = [], imports = [], exports = [], outer = false, prefix = '' } = options;

    /* oxlint-disable typescript/no-this-alias */
    const self = this;
    return this.set<ModuleMetadata>(context, [Sym.Module], {
      controllers: [...new Set(controllers)],
      providers: [...new Set(providers)],
      imports: [...new Set(imports)],
      exports: [...new Set(exports)],
      get accessibleProviderTokens() {
        const imported: Key[] = this.imports
          .map((m: Class | DynamicModule) => {
            const moduleClass = toModuleClass(m);
            return self.getModule(moduleClass).exports.map((e) => e.name);
          })
          .flat();
        const providerTokens: Key[] = this.providers.map((p: ProviderOptions) => provider.getToken(p));
        return [...providerTokens, ...imported, ...collection.globalProviders];
      },
      outer,
      prefix,
    });
  }

  getModule(cls: Class): ModuleMetadata {
    return this.get(cls, [Sym.Module]) as ModuleMetadata;
  }

  // #region Interceptors/Guards

  setInterceptor(context: ClassDecoratorContext) {
    return this.set(context, [Sym.Interceptor], true);
  }

  isInterceptor(cls: Class): boolean {
    return this.get(cls, [Sym.Interceptor]) ?? false;
  }

  setGuard(context: ClassDecoratorContext) {
    return this.set(context, [Sym.Guard], true);
  }

  isGuard(cls: Class): boolean {
    return this.get(cls, [Sym.Guard]) ?? false;
  }

  setFilters(context: ClassDecoratorContext, exceptionClasses: Class[]): boolean {
    return this.set(context, [Sym.Filter], exceptionClasses);
  }

  getFilters(cls: Class): Class[] | undefined {
    return this.get(cls, [Sym.Filter]);
  }

  setPipe(context: ClassDecoratorContext): boolean {
    return this.set(context, [Sym.Pipe], true);
  }

  isPipe(cls: Class): boolean {
    return this.get(cls, [Sym.Pipe]) ?? false;
  }

  // #region set/get+UseMiddlewares series
  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Provider]`
   * - Class level and method level will be stored in different symbols
   */
  setUseInterceptors(context: ClassDecoratorContext | ClassMethodDecoratorContext, tokens: InjectToken[]): boolean {
    if (context.kind === 'class') {
      return this.set(context, [Sym.ControllerInterceptor], tokens);
    }

    return this.set(context, [Sym.HandlerInterceptor, context.name], tokens);
  }

  getUseInterceptors(cls: Class): InterceptorGetter {
    const controller = this.get<InjectToken[]>(cls, [Sym.ControllerInterceptor]);
    const handler = this.get<Record<Key, InjectToken[]>>(cls, [Sym.HandlerInterceptor]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalInterceptors, controller, handler[field]);
    };
  }

  setUseGuards(context: ClassDecoratorContext | ClassMethodDecoratorContext, tokens: InjectToken[]): boolean {
    if (context.kind === 'class') {
      return this.set(context, [Sym.ControllerGuard], tokens);
    }
    return this.set(context, [Sym.HandlerGuard, context.name], tokens);
  }

  getUseGuards(cls: Class): GuardGetter {
    const controller = this.get<InjectToken[]>(cls, [Sym.ControllerGuard]) ?? [];
    const handler = this.get<Record<Key, InjectToken[]>>(cls, [Sym.HandlerGuard]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalGuards, controller, handler[field]);
    };
  }

  setUseFilters(context: ClassDecoratorContext | ClassMethodDecoratorContext, tokens: InjectToken[]): boolean {
    if (context.kind === 'class') {
      return this.set(context, [Sym.ControllerFilter], tokens);
    }
    return this.set(context, [Sym.HandlerFilter, context.name], tokens);
  }

  getUseFilters(cls: Class): FilterGetter {
    const controller = this.get<InjectToken[]>(cls, [Sym.ControllerFilter]) ?? [];
    const handler = this.get<Record<Key, InjectToken[]>>(cls, [Sym.HandlerFilter]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalFilters, controller, handler[field]);
    };
  }

  setUsePipes(context: ClassDecoratorContext | ClassMethodDecoratorContext, pipes: PipeOptions[]): boolean {
    if (context.kind === 'class') {
      return this.set(context, [Sym.ControllerPipe], pipes);
    }
    return this.set(context, [Sym.HandlerPipe, context.name], pipes);
  }

  getUsePipes(cls: Class): PipeGetter {
    const controller = this.get<PipeOptions[]>(cls, [Sym.ControllerPipe]) ?? [];
    const handler = this.get<Record<Key, PipeOptions[]>>(cls, [Sym.HandlerPipe]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalPipes, controller, handler[field]);
    };
  }

  /**
   * Fisrt method pipe is used to set schema for swagger
   */
  getFirstMethodPipeSchema(cls: Class, field: Key): PipeFullSchema | typeof Sym.NotProvided {
    const methodPipes = this.get<PipeOptions[]>(cls, [Sym.HandlerPipe, field]);
    if (!methodPipes) {
      // length > 0 is already assured by @UsePipes
      return Sym.NotProvided;
    }
    const { schema = Sym.NotProvided } = methodPipes[0];
    return schema;
  }
  // #endregion

  // #endregion
  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Custom][key]`
   */
  setCustom(context: DecoratorContext, key: Key, data: unknown) {
    return this.set(context, [Sym.Custom, key], data);
  }

  getCustom<T = unknown>(cls: Class, key: Key): T | undefined {
    return this.get(cls, [Sym.Custom, key]);
  }
}

const meta = new Meta();

export default meta;
