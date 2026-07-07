import { ReflectDeep } from 'reflect-deep';
import { concatArr, sym } from '@nestify/shared';
import { Class, Key } from '@core/types/primitive.js';
import { RouteBasic, RouteConfig, RouteOptType } from '@core/types/index.js';
import {
  ProviderMeta,
  ControllerMeta,
  InjectArg,
  InjectMetadata,
  ModuleMeta,
  DynamicModule,
  ProviderOptions,
  InjectToken,
} from '@core/types/injecorator.js';
import {
  RouteApiSchema,
  InterceptorGetter,
  GuardGetter,
  FilterGetter,
  PipeOptions,
  PipeGetter,
  PipeFullSchema,
} from '@core/types/middleware.js';

import { splitPath, toModuleClass } from '@core/common/utils.js';
import { collection } from './collection.js';
import ph from './provider.js';

/**
 * ! Methods here should be used **AFTER** validation of parameters
 */
/**
 * Directly set metadata on the context
 */
export function metaSet<T = unknown>(context: DecoratorContext, keys: Key[], value: T) {
  return ReflectDeep.set<T>(context.metadata, [sym.root, ...keys], value);
}

/**
 * Directly get metadata on the context
 */
export function metaGet<T = unknown>(cls: Class, keys: Key[]) {
  return ReflectDeep.get<T>(cls, [sym.metadata, sym.root, ...keys]);
}

export function metaSetController(context: ClassDecoratorContext, prefix?: string): boolean {
  const data: ProviderMeta = { args: [] };
  const controlled: ControllerMeta = { prefix: splitPath(prefix) };
  return metaSet(context, [sym.provider], data) && metaSet(context, [sym.controller], controlled);
}

export function metaGetController(cls: Class): ControllerMeta {
  return metaGet(cls, [sym.controller]) as ControllerMeta;
}

/**
 * Metadata is stored at: `class[sym.metadata][sym.root][sym.route][context.name][sym.route.base]`
 */
export function metaSetRoute(context: ClassMethodDecoratorContext, httpMethod: string, route?: string): boolean {
  const basic: RouteBasic = {
    method: httpMethod,
    route: splitPath(route),
    field: context.name,
  };
  return metaSet(context, [sym.route.root, context.name, sym.route.base], basic);
}

export function metaGetRoute(cls: Class): Record<Key, RouteConfig> {
  return metaGet(cls, [sym.route.root]) as Record<Key, RouteConfig>;
}

/**
 * Metadata is stored at: `class[sym.metadata][sym.root][sym.route][context.name][sym.route.opt]`
 */
export function metaSetOpt(context: ClassMethodDecoratorContext, opts: RouteOptType): boolean {
  return metaSet(context, [sym.route.root, context.name, sym.route.opt], opts);
}

/**
 * Metadata is stored at: `class[sym.metadata][sym.root][sym.route][context.name][sym.route.apiSchema]`
 */
export function metaSetSchema(context: ClassMethodDecoratorContext, schema: RouteApiSchema): boolean {
  return metaSet(context, [sym.route.root, context.name, sym.route.apiSchema], schema);
}

/**
 * Metadata is stored at: `class[sym.metadata][sym.root][sym.route][context.name][sym.route.args]`
 */
export function metaSetHandlerArgs(context: ClassMethodDecoratorContext, propertyPaths: string[][]) {
  return metaSet(context, [sym.route.root, context.name, sym.route.args], propertyPaths);
}

/**
 * Metadata is stored at: `class[sym.metadata][sym.root][sym.injection][context.name]`
 */
export function metaSetInject(context: ClassFieldDecoratorContext, dependency: InjectArg): boolean {
  const o: InjectMetadata = {
    dependency,
  };
  return metaSet(context, [sym.injection, context.name], o);
}

export function metaGetInject(cls: Class): Record<Key, InjectMetadata> | undefined {
  return metaGet<Record<Key, InjectMetadata>>(cls, [sym.injection]);
}

/**
 * Metadata is stored at: `class[sym.metadata][sym.root][sym.provider]`
 */
export function metaSetProvider(context: ClassDecoratorContext, args: unknown[] = []): boolean {
  const data: ProviderMeta = { args };
  return metaSet(context, [sym.provider], data);
}

/**
 * Directly set metadata on a class, used for `toModule(...)`
 *
 * Metadata is stored at: `class[sym.metadata][sym.root][sym.provider]`
 */
export function metaSetProviderOnClass(target: Class, args: unknown[] = []): boolean {
  const data: ProviderMeta = { args };
  return ReflectDeep.set(target, [sym.metadata, sym.root, sym.provider], data);
}

export function metaGetProvider(cls: Class): ProviderMeta {
  return metaGet(cls, [sym.provider]) as ProviderMeta;
}

/**
 * Metadata is stored at: `class[sym.metadata][sym.root][sym.module]`
 * - Will deduplicate each array automatically
 *
 * **normalize in the set method but not in get, makes it easier to detect bugs**
 * - some errors might be hidden when returning empty normalized metadata in get.
 */
export function metaSetModule(context: ClassDecoratorContext, options: Partial<ModuleMeta>): boolean {
  const { controllers = [], providers = [], imports = [], exports = [], outer = false, prefix = '' } = options;

  return metaSet<ModuleMeta>(context, [sym.module], {
    controllers: [...new Set(controllers)],
    providers: [...new Set(providers)],
    imports: [...new Set(imports)],
    exports: [...new Set(exports)],
    get accessibleProviderTokens() {
      const imported: Key[] = imports
        .map((m: Class | DynamicModule) => {
          const moduleClass = toModuleClass(m);
          return metaGetModule(moduleClass).exports.map((e) => e.name);
        })
        .flat();
      const providerTokens: Key[] = providers.map((p: ProviderOptions) => ph.getToken(p));
      return [...providerTokens, ...imported, ...collection.globalProviders];
    },
    outer,
    prefix,
  });
}

export function metaGetModule(cls: Class): ModuleMeta {
  return metaGet(cls, [sym.module]) as ModuleMeta;
}

// #region middlewares

export function metaSetInterceptor(context: ClassDecoratorContext) {
  return metaSet(context, [sym.interceptor.root], true);
}

export function metaIsInterceptor(cls: Class): boolean {
  return Boolean(metaGet(cls, [sym.interceptor.root]));
}

export function metaSetGuard(context: ClassDecoratorContext) {
  return metaSet(context, [sym.guard.root], true);
}

export function metaIsGuard(cls: Class): boolean {
  return Boolean(metaGet(cls, [sym.guard.root]));
}

export function metaSetFilters(context: ClassDecoratorContext, exceptionClasses: Class[]): boolean {
  return metaSet(context, [sym.filter.root], exceptionClasses);
}

export function metaGetFilters(cls: Class): Class[] | undefined {
  return metaGet(cls, [sym.filter.root]);
}

export function metaSetPipe(context: ClassDecoratorContext): boolean {
  return metaSet(context, [sym.pipe.root], true);
}

export function metaIsPipe(cls: Class): boolean {
  return Boolean(metaGet(cls, [sym.pipe.root]));
}
// #endregion

// #region set/get+UseMiddlewares series
/**
 * Metadata is stored at: `class[sym.metadata][sym.root][sym.interceptor]`
 * - Class level and method level will be stored in different symbols
 */
export function metaSetUseInterceptors(
  context: ClassDecoratorContext | ClassMethodDecoratorContext,
  tokens: InjectToken[],
): boolean {
  if (context.kind === 'class') {
    return metaSet(context, [sym.interceptor.controller], tokens);
  }

  return metaSet(context, [sym.interceptor.handler, context.name], tokens);
}

export function metaGetUseInterceptors(cls: Class): InterceptorGetter {
  const controller = metaGet<InjectToken[]>(cls, [sym.interceptor.controller]);
  const handler = metaGet<Record<Key, InjectToken[]>>(cls, [sym.interceptor.handler]) ?? {};
  return function (field: Key) {
    return concatArr(collection.globalInterceptors, controller, handler[field]);
  };
}

export function metaSetUseGuards(
  context: ClassDecoratorContext | ClassMethodDecoratorContext,
  tokens: InjectToken[],
): boolean {
  if (context.kind === 'class') {
    return metaSet(context, [sym.guard.controller], tokens);
  }
  return metaSet(context, [sym.guard.handler, context.name], tokens);
}

export function metaGetUseGuards(cls: Class): GuardGetter {
  const controller = metaGet<InjectToken[]>(cls, [sym.guard.controller]);
  const handler = metaGet<Record<Key, InjectToken[]>>(cls, [sym.guard.handler]) ?? {};
  return function (field: Key) {
    return concatArr(collection.globalGuards, controller, handler[field]);
  };
}

export function metaSetUseFilters(
  context: ClassDecoratorContext | ClassMethodDecoratorContext,
  tokens: InjectToken[],
): boolean {
  if (context.kind === 'class') {
    return metaSet(context, [sym.filter.controller], tokens);
  }
  return metaSet(context, [sym.filter.handler, context.name], tokens);
}

export function metaGetUseFilters(cls: Class): FilterGetter {
  const controller = metaGet<InjectToken[]>(cls, [sym.filter.controller]);
  const handler = metaGet<Record<Key, InjectToken[]>>(cls, [sym.filter.handler]) ?? {};
  return function (field: Key) {
    return concatArr(collection.globalFilters, controller, handler[field]);
  };
}

export function metaSetUsePipes(
  context: ClassDecoratorContext | ClassMethodDecoratorContext,
  pipes: PipeOptions[],
): boolean {
  if (context.kind === 'class') {
    return metaSet(context, [sym.pipe.controller], pipes);
  }
  return metaSet(context, [sym.pipe.handler, context.name], pipes);
}

export function metaGetUsePipes(cls: Class): PipeGetter {
  const controller = metaGet<PipeOptions[]>(cls, [sym.pipe.controller]);
  const handler = metaGet<Record<Key, PipeOptions[]>>(cls, [sym.pipe.handler]) ?? {};
  return function (field: Key) {
    return concatArr(collection.globalPipes, controller, handler[field]);
  };
}

/**
 * Fisrt method pipe is used to set schema for swagger
 */
export function metaGetFirstMethodPipeSchema(cls: Class, field: Key): PipeFullSchema | undefined {
  const methodPipes = metaGet<PipeOptions[]>(cls, [sym.pipe.handler, field]);
  if (!methodPipes) {
    // length > 0 is already assured by @UsePipes
    return undefined;
  }
  return methodPipes[0].schema;
}
// #endregion
