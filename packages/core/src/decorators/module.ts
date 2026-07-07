import type { ModuleMeta, DynamicModule } from '@core/types/injecorator.js';
import type { Class } from '@core/types/primitive.js';

import { ReflectDeep } from 'reflect-deep';
import { sym } from '@nestify/shared';

import { createNamedClass } from '@core/common/utils.js';
import { expectClassNotDecorated, expectModulable } from '@core/asserts/index.js';
import { metaSetModule } from '@core/register/meta.js';
import { toInjectable } from './injectable.js';

/**
 * Use on modules.
 *
 * - Sandbox mechanic: Every decorated module class has its own space
 * - Modules can be global-scoped, which means once imported into any module.
 *   - Global modules must be placed in the root. Or the providers who uses it might not be able to access it.
 * - Modules can import other modules, but cannot export controllers.
 * - Modules can export providers, which can be injected into other modules.
 */
export function Module(options: Partial<ModuleMeta>) {
  return function (target: Class, context: ClassDecoratorContext) {
    expectModulable(target, context);
    metaSetModule(context, options);
  };
}

interface ToModuleOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[];
  isGlobal: boolean;
}

/**
 * Make outer provider an importable Injecorator module
 * @param outerProvider
 */
export function toModule(outerProvider: Class, opt?: Partial<ToModuleOptions>): DynamicModule {
  const { isGlobal = false, args = [] } = Object(opt) as ToModuleOptions;
  expectClassNotDecorated(outerProvider, sym.provider);

  const injectable = toInjectable(outerProvider, args);
  // & Directly set everything in a temp class, not via `meta.setXXX`
  const temp = createNamedClass(`${outerProvider.name}Module`);
  ReflectDeep.set<ModuleMeta>(temp, [sym.metadata, sym.root, sym.module], {
    imports: [],
    providers: [injectable],
    controllers: [],
    exports: [injectable],
    accessibleProviderTokens: [],
    prefix: '',
    outer: true,
  });

  const dynamicModule: DynamicModule = {
    moduleClass: temp,
    isGlobal,
  };

  return dynamicModule;
}
