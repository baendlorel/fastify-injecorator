import { FastifyInstance } from 'fastify';
import { LazyInjectEntry, ProviderOptions, InjectToken, DynamicModule } from '@/types/injecorator.js';
import { InjecoratorMiddleware } from '@/types/middleware.js';

import { toModuleClass } from '@/common/index.js';
import { APP_LOGGER } from '@/common/inject-keys.js';
import { eisFunction, eisObject, expect, throws, wisClass, wisKey, wisObject } from '@/asserts/index.js';

import meta from './meta.js';
import ph from './provider.js';
import collection from './collection.js';

class LazyInjector {
  /**
   * Which `instance[propertyKey]` is waiting for lazy injection of `dependency`
   */
  private readonly injectList: LazyInjectEntry[] = [];

  /**
   * A map from token to the instance of Class
   */
  private readonly instanceMap = new Map<Key, Instance | null>();

  private getProvide(opts: ProviderOptions) {
    return wisClass(opts) ? opts.name : opts.provide;
  }

  get<T extends object>(token: InjectToken) {
    return this.instanceMap.get(wisKey(token) ? token : token.name) as T | undefined;
  }

  internalCreateInstanceByClass(cls: Class) {
    this.instanceMap.set(cls.name, new cls());
  }

  /**
   * Convert token array to a list of middleware hook functions
   * @param tokens
   * @param handlerName
   */
  getMiddlewareHooks<T extends InjecoratorMiddleware>(tokens: InjectToken[], handlerName: keyof T & Key): Func[] {
    return tokens.map((token) => {
      const instance = this.get(wisKey(token) ? token : token.name);
      eisObject<T>(instance, `Cannot find class for token: ${String(token)}`);
      const handler = instance[handlerName];
      eisFunction(handler, `Handler '${String(handlerName)}' not found in ${String(token)}`);
      return (...args) => handler.apply(instance, args);
    });
  }

  getDetail<T extends object>(token: InjectToken): { instance: T; cls: Class | null } {
    const instance = this.instanceMap.get(wisKey(token) ? token : token.name) as T;
    const cls = (Reflect.getPrototypeOf(instance)?.constructor ?? null) as Class | null;
    return { instance, cls };
  }

  /**
   * This function do 2 things:
   * - Create an instance of `cls` directly, but without injections
   * - Record the token, injected field name and `injectArg` into a list
   *   - This list will be used by `this.apply` after all instances are created
   */
  createInstanceByClass(token: Key, cls: Class) {
    const { args } = meta.getProvider(cls);
    const instance = Reflect.construct(cls, args);
    this.instanceMap.set(token, instance);

    const injects = meta.getInject(cls);
    if (injects) {
      const propertyKeys = Reflect.ownKeys(injects);
      for (let i = 0; i < propertyKeys.length; i++) {
        const propertyKey = propertyKeys[i];
        this.injectList.push({
          provide: token,
          propertyKey,
          dependency: injects[propertyKey].dependency,
        });
      }
    }

    // We do not care about whether the provider is global or not
    // Because we already asserted this in `registerModule` of register.ts
    return instance;
  }

  createInstance(opts: ProviderOptions): Instance {
    const token = this.getProvide(opts);
    const exist = this.instanceMap.get(token);
    if (wisObject<Instance>(exist)) {
      return exist;
    }
    return ph.match(opts, {
      useClass: (token, cls) => {
        return this.createInstanceByClass(token, cls);
      },
      useValue: (token, value) => {
        this.instanceMap.set(token, value);
        return value;
      },
      // ! This means the injections must be created after instanceMap being filled up
      useFactory: (token, factory, inject) => {
        const instances = inject.map((arg) => this.instanceMap.get(wisKey(arg) ? arg : arg.name));
        const instance = factory(...instances);
        this.instanceMap.set(token, instance);
        return instance;
      },
      useExisting: (token, existingToken) => {
        const instance = this.instanceMap.get(existingToken);
        if (!wisObject(instance)) {
          throws(`Cannot find existing provider: ${String(existingToken)}`);
        }
        this.instanceMap.set(token, instance);
        return instance;
      },
    });
  }

  /**
   * 1. Set `app.log` as `APP_LOGGER`
   * 2. Assign injected fields as `injectList` recorded
   */
  apply(app: FastifyInstance) {
    const map = this.instanceMap;
    // & Give default APP_LOGGER
    if (!map.has(APP_LOGGER)) {
      map.set(APP_LOGGER, app.log);
      collection.globalProviders.add(APP_LOGGER);
    }

    // & Inject instances
    for (let i = 0; i < this.injectList.length; i++) {
      const { provide, propertyKey, dependency } = this.injectList[i];
      const tokenOfDependency = ph.getInjectToken(dependency);

      expect(map.has(provide), `Provider '${String(provide)}' not found`);
      expect(
        map.has(tokenOfDependency),
        `Dependency '${String(tokenOfDependency)}' of a provider '${String(provide)}' not found. Maybe '${String(tokenOfDependency)}' is not decorated by @Injectable or something`
      );

      const instance = map.get(provide);
      // deal key/class/()=>class
      instance[propertyKey] = map.get(tokenOfDependency);
    }
  }

  checkMissedDependency() {
    for (let i = 0; i < this.injectList.length; i++) {
      const { provide, propertyKey, dependency } = this.injectList[i];
      const instance = this.instanceMap.get(provide);
      const name = ph.getInjectTokenName(dependency);
      expect(
        Reflect.has(instance, propertyKey),
        `${String(provide)}[${String(propertyKey)}] depends on '${name}', but it is not given`
      );
    }
  }

  checkCircularDependency(rootModule: Class) {
    const stack: Class[] = [];

    const visit = (m: Class | DynamicModule) => {
      const moduleClass = toModuleClass(m);
      if (stack.includes(moduleClass)) {
        const chain = stack.map((s) => s.name).join(' -> ');
        throws(`Circular dependency detected: ${chain} -> ${String(moduleClass.name)}`);
      }
      stack.push(moduleClass);
      const moduleMetadata = meta.getModule(moduleClass);
      moduleMetadata.imports.forEach(visit);
      stack.pop();
    };

    visit(rootModule);
  }

  /**
   * When the lazy injection is done, clears:
   * - instanceMap
   * - injectList
   */
  clear() {
    this.injectList.splice(0);
    this.instanceMap.clear();
  }
}

const lazyInjector = new LazyInjector();
export default lazyInjector;
