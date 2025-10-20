import { FastifyInstance } from 'fastify';
import { toDynamicModule, toModuleClass } from '@/common/index.js';
import { expect } from '@/asserts/index.js';
import { tryToGetGlobalToken } from '@/common/inject-keys.js';

import collection from './collection.js';
import expectModule from './expect-module.js';
import lazyInjector from './lazy-injector.js';
import meta from './meta.js';
import { registerController } from './route/controller.js';

// internal basic pipes
import { PipeBody } from '../decorators/middlewares/pipes/body.pipe.js';
import { PipeIp } from '../decorators/middlewares/pipes/ip.pipe.js';
import { PipeParams } from '../decorators/middlewares/pipes/params.pipe.js';
import { PipeQuery } from '../decorators/middlewares/pipes/query.pipe.js';
import { PipeRaw } from '../decorators/middlewares/pipes/raw.pipe.js';

class ModuleRegister {
  private readonly moduleStack: Class[] = [];
  private app: FastifyInstance;
  private opts: FastifyInjecoratorOptions;

  /**
   * Collect every global things into `collection`
   * - modules
   * - global provider tokens from 'inject-keys.ts'
   * @param mod
   */
  collectGlobal(mod: Class | DynamicModule) {
    const { moduleClass, isGlobal } = toDynamicModule(mod);
    if (isGlobal) {
      const alreadAdded = collection.addGlobalModule(moduleClass);
      if (alreadAdded) {
        return; // already registered, prevent infinite loop
      }
    }

    const m = meta.getModule(moduleClass);
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
        lazyInjector.createInstance(providerOptions);
      }
    }
  }

  visit(mod: Class | DynamicModule, inherited: InheritedModuleMetadata = { prefix: [] }): void {
    const moduleClass = toModuleClass(mod);

    if (this.moduleStack.includes(moduleClass)) {
      const chain = this.moduleStack.map((m) => m.name).join(' -> ') + ` -> ${moduleClass.name}`;
      if (this.opts.allowCrossModuleCircularReference) {
        // if allowed, return directly since it is definitely registered before
        return;
      }
      expect.throws(`Circular dependency detected: ${chain}`);
    } else {
      this.moduleStack.push(moduleClass);
    }

    expectModule.isModule(moduleClass);

    // & When setting the module metadata, each array(providers, controllers, etc.)
    // & will all be set as an array
    const m = meta.getModule(moduleClass);
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
      expectModule.accessibleProviders(providerOptions, m.accessibleProviderTokens);
      lazyInjector.createInstance(providerOptions);
    }

    // register routes
    for (let i = 0; i < m.controllers.length; i++) {
      const controller = m.controllers[i];
      expectModule.accessibleProviders(controller, m.accessibleProviderTokens);
      registerController(this.app, controller, fullPrefix);
    }
  }

  createBasicPipes() {
    lazyInjector.internalCreateInstanceByClass(PipeBody);
    lazyInjector.internalCreateInstanceByClass(PipeParams);
    lazyInjector.internalCreateInstanceByClass(PipeIp);
    lazyInjector.internalCreateInstanceByClass(PipeQuery);
    lazyInjector.internalCreateInstanceByClass(PipeRaw);
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

    // create basic pipes
    this.createBasicPipes();

    // register every module recursively
    this.visit(this.opts.rootModule);
    lazyInjector.apply(this.app);

    // recover thie existed
    if (existedValidatorCompiler) {
      app.setValidatorCompiler(existedValidatorCompiler);
    }
  }
}

const moduleRegister = new ModuleRegister();
export default moduleRegister;
