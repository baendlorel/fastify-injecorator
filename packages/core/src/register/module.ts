import type { FastifyInstance } from 'fastify';
import type { FastifyInjecoratorOptions, DynamicModule, InheritedModuleMeta } from '@core/types/injecorator.js';
import type { Constructable } from '@nestify/shared';

import { toDynamicModule, toModuleClass } from '@core/common/index.js';
import { tryToGetGlobalToken } from '@core/common/inject-keys.js';

import { collection } from './collection.js';
import { expectAccessible, expectModule } from './expect-module.js';
import { injector } from './lazy-injector.js';
import { metaGetModule } from './meta.js';
import { registerController } from './route/controller.js';

class ModuleRegister {
  private readonly moduleStack: Constructable[] = [];
  private app!: FastifyInstance;
  private opts!: FastifyInjecoratorOptions;

  /**
   * Collect every global things into `collection`
   * - modules
   * - global provider tokens from 'inject-keys.ts'
   * @param mod
   */
  collectGlobal(mod: Constructable | DynamicModule) {
    const { moduleClass, isGlobal } = toDynamicModule(mod);
    if (isGlobal) {
      const alreadAdded = collection.addGlobalModule(moduleClass);
      if (alreadAdded) {
        return; // already registered, prevent infinite loop
      }
    }

    const m = metaGetModule(moduleClass);
    for (let i = 0; i < m.imports.length; i++) {
      this.collectGlobal(m.imports[i]);
    }

    // & if global token is detected, add them to collection
    for (let i = 0; i < m.providers.length; i++) {
      const providerOptions = m.providers[i];
      const globalToken = tryToGetGlobalToken(providerOptions);
      if (globalToken) {
        // & this will automically detect global tokens and add them
        collection.addGlobalMiddleware(globalToken);
        injector.createInstance(providerOptions);
      }
    }
  }

  visit(mod: Constructable | DynamicModule, inherited: InheritedModuleMeta = { prefix: [] }): void {
    const moduleClass = toModuleClass(mod);

    if (this.moduleStack.includes(moduleClass)) {
      const chain = this.moduleStack.map((m) => m.name).join(' -> ') + ` -> ${moduleClass.name}`;
      if (this.opts.allowCrossModuleCircularReference) {
        // if allowed, return directly since it is definitely registered before
        return;
      }
      _throw(`Circular dependency detected: ${chain}`);
    } else {
      this.moduleStack.push(moduleClass);
    }

    expectModule(moduleClass);

    // & When setting the module metadata, each array(providers, controllers, etc.)
    // & will all be set as an array
    const m = metaGetModule(moduleClass);
    const fullPrefix = [...inherited.prefix, m.prefix];

    // imports modules recursively
    // modules are no needed to be instantiated, we only cares about their metadata
    for (let i = 0; i < m.imports.length; i++) {
      this.visit(m.imports[i], { prefix: fullPrefix });
    }

    // & AccessibleProviders are from imported modules and itself
    for (let i = 0; i < m.providers.length; i++) {
      const providerOptions = m.providers[i];
      if (tryToGetGlobalToken(providerOptions)) {
        continue;
      }
      expectAccessible(providerOptions, m.accessibleProviderTokens);
      injector.createInstance(providerOptions);
    }

    // register routes
    for (let i = 0; i < m.controllers.length; i++) {
      const controller = m.controllers[i];
      expectAccessible(controller, m.accessibleProviderTokens);
      registerController(this.app, controller, fullPrefix);
    }

    // pop the module from stack after processing
    this.moduleStack.pop();
  }

  /**
   * Create basic pipe instances via setup callback.
   * Sub-packages (e.g. @nestify/schema) provide the setup function
   * to register their preset pipes.
   */
  runSetup(setup?: (register: (cls: Constructable) => void) => void) {
    if (setup) {
      setup((cls) => injector.internalCreateInstanceByClass(cls));
    }
  }

  /**
   * Collect global modules(for accessibleProviders), then register recursively.
   * @param app fastify instance
   * @param rootModule the main module
   */
  apply(app: FastifyInstance, opts: FastifyInjecoratorOptions) {
    this.app = app;
    this.opts = opts;

    this.collectGlobal(this.opts.rootModule);
    collection.assembleGlobalProviders();

    // prevent fastify to generate default validators
    const existedValidatorCompiler = app.validatorCompiler;
    app.setValidatorCompiler(() => () => true);

    // run setup callback to create basic pipes (from sub-packages)
    this.runSetup(this.opts.setup);

    // register every module recursively
    this.visit(this.opts.rootModule);
    injector.apply(this.app);

    // recover thie existed
    if (existedValidatorCompiler) {
      app.setValidatorCompiler(existedValidatorCompiler);
    }
  }
}

const moduleRegister = new ModuleRegister();
export default moduleRegister;
