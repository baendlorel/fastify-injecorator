import { ReflectDeep } from 'reflect-deep';
import { concatArr } from 'concat-arr';
import { Class, Key } from '@/types/primitive.js';
import { RouteBasic, RouteConfig, RouteOptType } from '@/types/index.js';
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
import collection from './collection.js';
import ph from './provider.js';

/**
 * ! Methods here should be used **AFTER** validation of parameters
 */
class Meta {
  private set<T = unknown>(context: DecoratorContext, keys: Key[], value: T) {
    return ReflectDeep.set<T>(context.metadata, [Sym.root, ...keys], value);
  }

  private get<T = unknown>(cls: Class, keys: Key[]) {
    return ReflectDeep.get<T>(cls, [Sym.metadata, Sym.root, ...keys]);
  }

  setController(context: ClassDecoratorContext, prefix?: string): boolean {
    const data: ProviderMetadata = { args: [] };
    const controlled: ControllerMetadata = { prefix: splitPath(prefix) };
    return this.set(context, [Sym.provider], data) && this.set(context, [Sym.controller], controlled);
  }

  getController(cls: Class): ControllerMetadata {
    return this.get(cls, [Sym.controller]) as ControllerMetadata;
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
    return this.set(context, [Sym.route, context.name, Sym.routeBase], basic);
  }

  getRoute(cls: Class): Record<Key, RouteConfig> {
    return this.get(cls, [Sym.route]) as Record<Key, RouteConfig>;
  }

  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Route][context.name][Sym.RouteOpt]`
   */
  setOpt(context: ClassMethodDecoratorContext, opts: RouteOptType): boolean {
    return this.set(context, [Sym.route, context.name, Sym.routeOpt], opts);
  }

  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Route][context.name][Sym.RouteSchema]`
   */
  setSchema(context: ClassMethodDecoratorContext, schema: RouteApiSchema): boolean {
    return this.set(context, [Sym.route, context.name, Sym.routeApiSchema], schema);
  }

  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Route][context.name][Sym.HandlerArgs]`
   */
  setHandlerArgs(context: ClassMethodDecoratorContext, propertyPaths: string[][]) {
    return this.set(context, [Sym.route, context.name, Sym.handlerArgs], propertyPaths);
  }

  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Inject][context.name]`
   */
  setInject(context: ClassFieldDecoratorContext, dependency: InjectArg): boolean {
    const o: InjectMetadata = {
      dependency,
    };
    return this.set(context, [Sym.injection, context.name], o);
  }

  getInject(cls: Class): Record<Key, InjectMetadata> | undefined {
    return this.get<Record<Key, InjectMetadata>>(cls, [Sym.injection]);
  }

  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Provider]`
   */
  setProvider(context: ClassDecoratorContext, args: unknown[] = []): boolean {
    const data: ProviderMetadata = { args };
    return this.set(context, [Sym.provider], data);
  }

  /**
   * Directly set metadata on a class, used for `toModule(...)`
   *
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Provider]`
   */
  setProviderOnClass(target: Class, args: unknown[] = []): boolean {
    const data: ProviderMetadata = { args };
    return ReflectDeep.set(target, [Sym.metadata, Sym.root, Sym.provider], data);
  }

  getProvider(cls: Class): ProviderMetadata {
    return this.get(cls, [Sym.provider]) as ProviderMetadata;
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
    return this.set<ModuleMetadata>(context, [Sym.module], {
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
        const providerTokens: Key[] = this.providers.map((p: ProviderOptions) => ph.getToken(p));
        return [...providerTokens, ...imported, ...collection.globalProviders];
      },
      outer,
      prefix,
    });
  }

  getModule(cls: Class): ModuleMetadata {
    return this.get(cls, [Sym.module]) as ModuleMetadata;
  }

  // #region Interceptors/Guards

  setInterceptor(context: ClassDecoratorContext) {
    return this.set(context, [Sym.interceptor], true);
  }

  isInterceptor(cls: Class): boolean {
    return Boolean(this.get(cls, [Sym.interceptor]));
  }

  setGuard(context: ClassDecoratorContext) {
    return this.set(context, [Sym.guard], true);
  }

  isGuard(cls: Class): boolean {
    return Boolean(this.get(cls, [Sym.guard]));
  }

  setFilters(context: ClassDecoratorContext, exceptionClasses: Class[]): boolean {
    return this.set(context, [Sym.filter], exceptionClasses);
  }

  getFilters(cls: Class): Class[] | undefined {
    return this.get(cls, [Sym.filter]);
  }

  setPipe(context: ClassDecoratorContext): boolean {
    return this.set(context, [Sym.pipe], true);
  }

  isPipe(cls: Class): boolean {
    return Boolean(this.get(cls, [Sym.pipe]));
  }

  // #region set/get+UseMiddlewares series
  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Provider]`
   * - Class level and method level will be stored in different symbols
   */
  setUseInterceptors(context: ClassDecoratorContext | ClassMethodDecoratorContext, tokens: InjectToken[]): boolean {
    if (context.kind === 'class') {
      return this.set(context, [Sym.controllerInterceptor], tokens);
    }

    return this.set(context, [Sym.handlerInterceptor, context.name], tokens);
  }

  getUseInterceptors(cls: Class): InterceptorGetter {
    const controller = this.get<InjectToken[]>(cls, [Sym.controllerInterceptor]);
    const handler = this.get<Record<Key, InjectToken[]>>(cls, [Sym.handlerInterceptor]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalInterceptors, controller, handler[field]);
    };
  }

  setUseGuards(context: ClassDecoratorContext | ClassMethodDecoratorContext, tokens: InjectToken[]): boolean {
    if (context.kind === 'class') {
      return this.set(context, [Sym.controllerGuard], tokens);
    }
    return this.set(context, [Sym.handlerGuard, context.name], tokens);
  }

  getUseGuards(cls: Class): GuardGetter {
    const controller = this.get<InjectToken[]>(cls, [Sym.controllerGuard]);
    const handler = this.get<Record<Key, InjectToken[]>>(cls, [Sym.handlerGuard]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalGuards, controller, handler[field]);
    };
  }

  setUseFilters(context: ClassDecoratorContext | ClassMethodDecoratorContext, tokens: InjectToken[]): boolean {
    if (context.kind === 'class') {
      return this.set(context, [Sym.controllerFilter], tokens);
    }
    return this.set(context, [Sym.handlerFilter, context.name], tokens);
  }

  getUseFilters(cls: Class): FilterGetter {
    const controller = this.get<InjectToken[]>(cls, [Sym.controllerFilter]);
    const handler = this.get<Record<Key, InjectToken[]>>(cls, [Sym.handlerFilter]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalFilters, controller, handler[field]);
    };
  }

  setUsePipes(context: ClassDecoratorContext | ClassMethodDecoratorContext, pipes: PipeOptions[]): boolean {
    if (context.kind === 'class') {
      return this.set(context, [Sym.controllerPipe], pipes);
    }
    return this.set(context, [Sym.handlerPipe, context.name], pipes);
  }

  getUsePipes(cls: Class): PipeGetter {
    const controller = this.get<PipeOptions[]>(cls, [Sym.controllerPipe]);
    const handler = this.get<Record<Key, PipeOptions[]>>(cls, [Sym.handlerPipe]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalPipes, controller, handler[field]);
    };
  }

  /**
   * Fisrt method pipe is used to set schema for swagger
   */
  getFirstMethodPipeSchema(cls: Class, field: Key): PipeFullSchema | undefined {
    const methodPipes = this.get<PipeOptions[]>(cls, [Sym.handlerPipe, field]);
    if (!methodPipes) {
      // length > 0 is already assured by @UsePipes
      return undefined;
    }
    return methodPipes[0].schema;
  }
  // #endregion

  // #endregion
  /**
   * Metadata is stored at: `class[Sym.metadata][Sym.Root][Sym.Custom][key]`
   */
  setCustom(context: DecoratorContext, key: Key, data: unknown) {
    return this.set(context, [Sym.custom, key], data);
  }

  getCustom<T = unknown>(cls: Class, key: Key): T | undefined {
    return this.get(cls, [Sym.custom, key]);
  }
}

const meta = new Meta();

export default meta;
