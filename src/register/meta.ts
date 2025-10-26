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

import { sym } from '@/common/index.js';
import { splitPath, toModuleClass } from '@/common/utils.js';
import collection from './collection.js';
import ph from './provider.js';

/**
 * ! Methods here should be used **AFTER** validation of parameters
 */
class Meta {
  set<T = unknown>(context: DecoratorContext, keys: Key[], value: T) {
    return ReflectDeep.set<T>(context.metadata, [sym.root, ...keys], value);
  }

  get<T = unknown>(cls: Class, keys: Key[]) {
    return ReflectDeep.get<T>(cls, [sym.metadata, sym.root, ...keys]);
  }

  setController(context: ClassDecoratorContext, prefix?: string): boolean {
    const data: ProviderMetadata = { args: [] };
    const controlled: ControllerMetadata = { prefix: splitPath(prefix) };
    return this.set(context, [sym.provider], data) && this.set(context, [sym.controller], controlled);
  }

  getController(cls: Class): ControllerMetadata {
    return this.get(cls, [sym.controller]) as ControllerMetadata;
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Route][context.name][sym.RouteBasic]`
   */
  setRoute(context: ClassMethodDecoratorContext, httpMethod: string, route?: string): boolean {
    const basic: RouteBasic = {
      method: httpMethod,
      route: splitPath(route),
      field: context.name,
    };
    return this.set(context, [sym.route.root, context.name, sym.route.base], basic);
  }

  getRoute(cls: Class): Record<Key, RouteConfig> {
    return this.get(cls, [sym.route.root]) as Record<Key, RouteConfig>;
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Route][context.name][sym.RouteOpt]`
   */
  setOpt(context: ClassMethodDecoratorContext, opts: RouteOptType): boolean {
    return this.set(context, [sym.route.root, context.name, sym.route.opt], opts);
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Route][context.name][sym.RouteSchema]`
   */
  setSchema(context: ClassMethodDecoratorContext, schema: RouteApiSchema): boolean {
    return this.set(context, [sym.route.root, context.name, sym.route.apiSchema], schema);
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Route][context.name][sym.HandlerArgs]`
   */
  setHandlerArgs(context: ClassMethodDecoratorContext, propertyPaths: string[][]) {
    return this.set(context, [sym.route.root, context.name, sym.route.args], propertyPaths);
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Inject][context.name]`
   */
  setInject(context: ClassFieldDecoratorContext, dependency: InjectArg): boolean {
    const o: InjectMetadata = {
      dependency,
    };
    return this.set(context, [sym.injection, context.name], o);
  }

  getInject(cls: Class): Record<Key, InjectMetadata> | undefined {
    return this.get<Record<Key, InjectMetadata>>(cls, [sym.injection]);
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Provider]`
   */
  setProvider(context: ClassDecoratorContext, args: unknown[] = []): boolean {
    const data: ProviderMetadata = { args };
    return this.set(context, [sym.provider], data);
  }

  /**
   * Directly set metadata on a class, used for `toModule(...)`
   *
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Provider]`
   */
  setProviderOnClass(target: Class, args: unknown[] = []): boolean {
    const data: ProviderMetadata = { args };
    return ReflectDeep.set(target, [sym.metadata, sym.root, sym.provider], data);
  }

  getProvider(cls: Class): ProviderMetadata {
    return this.get(cls, [sym.provider]) as ProviderMetadata;
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Provider]`
   * - Will deduplicate each array automatically
   *
   * **normalize in the set method but not in get, makes it easier to detect bugs**
   * - some errors might be hidden when returning empty normalized metadata in get.
   */
  setModule(context: ClassDecoratorContext, options: Partial<ModuleMetadata>): boolean {
    const { controllers = [], providers = [], imports = [], exports = [], outer = false, prefix = '' } = options;

    /* oxlint-disable typescript/no-this-alias */
    const self = this;
    return this.set<ModuleMetadata>(context, [sym.module], {
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
    return this.get(cls, [sym.module]) as ModuleMetadata;
  }

  // #region Interceptors/Guards

  setInterceptor(context: ClassDecoratorContext) {
    return this.set(context, [sym.interceptor.root], true);
  }

  isInterceptor(cls: Class): boolean {
    return Boolean(this.get(cls, [sym.interceptor.root]));
  }

  setGuard(context: ClassDecoratorContext) {
    return this.set(context, [sym.guard.root], true);
  }

  isGuard(cls: Class): boolean {
    return Boolean(this.get(cls, [sym.guard.root]));
  }

  setFilters(context: ClassDecoratorContext, exceptionClasses: Class[]): boolean {
    return this.set(context, [sym.filter.root], exceptionClasses);
  }

  getFilters(cls: Class): Class[] | undefined {
    return this.get(cls, [sym.filter.root]);
  }

  setPipe(context: ClassDecoratorContext): boolean {
    return this.set(context, [sym.pipe.root], true);
  }

  isPipe(cls: Class): boolean {
    return Boolean(this.get(cls, [sym.pipe.root]));
  }

  // #region set/get+UseMiddlewares series
  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Provider]`
   * - Class level and method level will be stored in different symbols
   */
  setUseInterceptors(context: ClassDecoratorContext | ClassMethodDecoratorContext, tokens: InjectToken[]): boolean {
    if (context.kind === 'class') {
      return this.set(context, [sym.interceptor.controller], tokens);
    }

    return this.set(context, [sym.interceptor.handler, context.name], tokens);
  }

  getUseInterceptors(cls: Class): InterceptorGetter {
    const controller = this.get<InjectToken[]>(cls, [sym.interceptor.controller]);
    const handler = this.get<Record<Key, InjectToken[]>>(cls, [sym.interceptor.handler]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalInterceptors, controller, handler[field]);
    };
  }

  setUseGuards(context: ClassDecoratorContext | ClassMethodDecoratorContext, tokens: InjectToken[]): boolean {
    if (context.kind === 'class') {
      return this.set(context, [sym.guard.controller], tokens);
    }
    return this.set(context, [sym.guard.handler, context.name], tokens);
  }

  getUseGuards(cls: Class): GuardGetter {
    const controller = this.get<InjectToken[]>(cls, [sym.guard.controller]);
    const handler = this.get<Record<Key, InjectToken[]>>(cls, [sym.guard.handler]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalGuards, controller, handler[field]);
    };
  }

  setUseFilters(context: ClassDecoratorContext | ClassMethodDecoratorContext, tokens: InjectToken[]): boolean {
    if (context.kind === 'class') {
      return this.set(context, [sym.filter.controller], tokens);
    }
    return this.set(context, [sym.filter.handler, context.name], tokens);
  }

  getUseFilters(cls: Class): FilterGetter {
    const controller = this.get<InjectToken[]>(cls, [sym.filter.controller]);
    const handler = this.get<Record<Key, InjectToken[]>>(cls, [sym.filter.handler]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalFilters, controller, handler[field]);
    };
  }

  setUsePipes(context: ClassDecoratorContext | ClassMethodDecoratorContext, pipes: PipeOptions[]): boolean {
    if (context.kind === 'class') {
      return this.set(context, [sym.pipe.controller], pipes);
    }
    return this.set(context, [sym.pipe.handler, context.name], pipes);
  }

  getUsePipes(cls: Class): PipeGetter {
    const controller = this.get<PipeOptions[]>(cls, [sym.pipe.controller]);
    const handler = this.get<Record<Key, PipeOptions[]>>(cls, [sym.pipe.handler]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalPipes, controller, handler[field]);
    };
  }

  /**
   * Fisrt method pipe is used to set schema for swagger
   */
  getFirstMethodPipeSchema(cls: Class, field: Key): PipeFullSchema | undefined {
    const methodPipes = this.get<PipeOptions[]>(cls, [sym.pipe.handler, field]);
    if (!methodPipes) {
      // length > 0 is already assured by @UsePipes
      return undefined;
    }
    return methodPipes[0].schema;
  }
  // #endregion

  // #endregion
}

const meta = new Meta();

export default meta;
