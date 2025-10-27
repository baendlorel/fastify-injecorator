import { ReflectDeep } from 'reflect-deep';
import { concatArr } from 'concat-arr';
import { Class, Key } from '@/types/primitive.js';
import { RouteBasic, RouteConfig, RouteOptType } from '@/types/index.js';
import {
  ProviderMeta,
  ControllerMeta,
  InjectArg,
  InjectMetadata,
  ModuleMeta,
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
namespace meta {
  /**
   * Directly set metadata on the context
   */
  export function set<T = unknown>(context: DecoratorContext, keys: Key[], value: T) {
    return ReflectDeep.set<T>(context.metadata, [sym.root, ...keys], value);
  }

  /**
   * Directly get metadata on the context
   */
  export function get<T = unknown>(cls: Class, keys: Key[]) {
    return ReflectDeep.get<T>(cls, [sym.metadata, sym.root, ...keys]);
  }

  export function setController(context: ClassDecoratorContext, prefix?: string): boolean {
    const data: ProviderMeta = { args: [] };
    const controlled: ControllerMeta = { prefix: splitPath(prefix) };
    return set(context, [sym.provider], data) && set(context, [sym.controller], controlled);
  }

  export function getController(cls: Class): ControllerMeta {
    return get(cls, [sym.controller]) as ControllerMeta;
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Route][context.name][sym.RouteBasic]`
   */
  export function setRoute(context: ClassMethodDecoratorContext, httpMethod: string, route?: string): boolean {
    const basic: RouteBasic = {
      method: httpMethod,
      route: splitPath(route),
      field: context.name,
    };
    return set(context, [sym.route.root, context.name, sym.route.base], basic);
  }

  export function getRoute(cls: Class): Record<Key, RouteConfig> {
    return get(cls, [sym.route.root]) as Record<Key, RouteConfig>;
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Route][context.name][sym.RouteOpt]`
   */
  export function setOpt(context: ClassMethodDecoratorContext, opts: RouteOptType): boolean {
    return set(context, [sym.route.root, context.name, sym.route.opt], opts);
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Route][context.name][sym.RouteSchema]`
   */
  export function setSchema(context: ClassMethodDecoratorContext, schema: RouteApiSchema): boolean {
    return set(context, [sym.route.root, context.name, sym.route.apiSchema], schema);
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Route][context.name][sym.HandlerArgs]`
   */
  export function setHandlerArgs(context: ClassMethodDecoratorContext, propertyPaths: string[][]) {
    return set(context, [sym.route.root, context.name, sym.route.args], propertyPaths);
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Inject][context.name]`
   */
  export function setInject(context: ClassFieldDecoratorContext, dependency: InjectArg): boolean {
    const o: InjectMetadata = {
      dependency,
    };
    return set(context, [sym.injection, context.name], o);
  }

  export function getInject(cls: Class): Record<Key, InjectMetadata> | undefined {
    return get<Record<Key, InjectMetadata>>(cls, [sym.injection]);
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Provider]`
   */
  export function setProvider(context: ClassDecoratorContext, args: unknown[] = []): boolean {
    const data: ProviderMeta = { args };
    return set(context, [sym.provider], data);
  }

  /**
   * Directly set metadata on a class, used for `toModule(...)`
   *
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Provider]`
   */
  export function setProviderOnClass(target: Class, args: unknown[] = []): boolean {
    const data: ProviderMeta = { args };
    return ReflectDeep.set(target, [sym.metadata, sym.root, sym.provider], data);
  }

  export function getProvider(cls: Class): ProviderMeta {
    return get(cls, [sym.provider]) as ProviderMeta;
  }

  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Provider]`
   * - Will deduplicate each array automatically
   *
   * **normalize in the set method but not in get, makes it easier to detect bugs**
   * - some errors might be hidden when returning empty normalized metadata in get.
   */
  export function setModule(context: ClassDecoratorContext, options: Partial<ModuleMeta>): boolean {
    const { controllers = [], providers = [], imports = [], exports = [], outer = false, prefix = '' } = options;

    return set<ModuleMeta>(context, [sym.module], {
      controllers: [...new Set(controllers)],
      providers: [...new Set(providers)],
      imports: [...new Set(imports)],
      exports: [...new Set(exports)],
      get accessibleProviderTokens() {
        const imported: Key[] = imports
          .map((m: Class | DynamicModule) => {
            const moduleClass = toModuleClass(m);
            return getModule(moduleClass).exports.map((e) => e.name);
          })
          .flat();
        const providerTokens: Key[] = providers.map((p: ProviderOptions) => ph.getToken(p));
        return [...providerTokens, ...imported, ...collection.globalProviders];
      },
      outer,
      prefix,
    });
  }

  export function getModule(cls: Class): ModuleMeta {
    return get(cls, [sym.module]) as ModuleMeta;
  }

  // #region Interceptors/Guards

  export function setInterceptor(context: ClassDecoratorContext) {
    return set(context, [sym.interceptor.root], true);
  }

  export function isInterceptor(cls: Class): boolean {
    return Boolean(get(cls, [sym.interceptor.root]));
  }

  export function setGuard(context: ClassDecoratorContext) {
    return set(context, [sym.guard.root], true);
  }

  export function isGuard(cls: Class): boolean {
    return Boolean(get(cls, [sym.guard.root]));
  }

  export function setFilters(context: ClassDecoratorContext, exceptionClasses: Class[]): boolean {
    return set(context, [sym.filter.root], exceptionClasses);
  }

  export function getFilters(cls: Class): Class[] | undefined {
    return get(cls, [sym.filter.root]);
  }

  export function setPipe(context: ClassDecoratorContext): boolean {
    return set(context, [sym.pipe.root], true);
  }

  export function isPipe(cls: Class): boolean {
    return Boolean(get(cls, [sym.pipe.root]));
  }

  // #region set/get+UseMiddlewares series
  /**
   * Metadata is stored at: `class[sym.metadata][sym.Root][sym.Provider]`
   * - Class level and method level will be stored in different symbols
   */
  export function setUseInterceptors(
    context: ClassDecoratorContext | ClassMethodDecoratorContext,
    tokens: InjectToken[]
  ): boolean {
    if (context.kind === 'class') {
      return set(context, [sym.interceptor.controller], tokens);
    }

    return set(context, [sym.interceptor.handler, context.name], tokens);
  }

  export function getUseInterceptors(cls: Class): InterceptorGetter {
    const controller = get<InjectToken[]>(cls, [sym.interceptor.controller]);
    const handler = get<Record<Key, InjectToken[]>>(cls, [sym.interceptor.handler]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalInterceptors, controller, handler[field]);
    };
  }

  export function setUseGuards(
    context: ClassDecoratorContext | ClassMethodDecoratorContext,
    tokens: InjectToken[]
  ): boolean {
    if (context.kind === 'class') {
      return set(context, [sym.guard.controller], tokens);
    }
    return set(context, [sym.guard.handler, context.name], tokens);
  }

  export function getUseGuards(cls: Class): GuardGetter {
    const controller = get<InjectToken[]>(cls, [sym.guard.controller]);
    const handler = get<Record<Key, InjectToken[]>>(cls, [sym.guard.handler]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalGuards, controller, handler[field]);
    };
  }

  export function setUseFilters(
    context: ClassDecoratorContext | ClassMethodDecoratorContext,
    tokens: InjectToken[]
  ): boolean {
    if (context.kind === 'class') {
      return set(context, [sym.filter.controller], tokens);
    }
    return set(context, [sym.filter.handler, context.name], tokens);
  }

  export function getUseFilters(cls: Class): FilterGetter {
    const controller = get<InjectToken[]>(cls, [sym.filter.controller]);
    const handler = get<Record<Key, InjectToken[]>>(cls, [sym.filter.handler]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalFilters, controller, handler[field]);
    };
  }

  export function setUsePipes(
    context: ClassDecoratorContext | ClassMethodDecoratorContext,
    pipes: PipeOptions[]
  ): boolean {
    if (context.kind === 'class') {
      return set(context, [sym.pipe.controller], pipes);
    }
    return set(context, [sym.pipe.handler, context.name], pipes);
  }

  export function getUsePipes(cls: Class): PipeGetter {
    const controller = get<PipeOptions[]>(cls, [sym.pipe.controller]);
    const handler = get<Record<Key, PipeOptions[]>>(cls, [sym.pipe.handler]) ?? {};
    return function (field: Key) {
      return concatArr(collection.globalPipes, controller, handler[field]);
    };
  }

  /**
   * Fisrt method pipe is used to set schema for swagger
   */
  export function getFirstMethodPipeSchema(cls: Class, field: Key): PipeFullSchema | undefined {
    const methodPipes = get<PipeOptions[]>(cls, [sym.pipe.handler, field]);
    if (!methodPipes) {
      // length > 0 is already assured by @UsePipes
      return undefined;
    }
    return methodPipes[0].schema;
  }
  // #endregion

  // #endregion
}

export default meta;
