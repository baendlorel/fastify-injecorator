import { whether } from '@/asserts/index.js';
import { APP_LOGGER } from '@/common/inject-keys.js';
import lazyInjector from '@/register/lazy-injector.js';

class TestingModule {
  private readonly injectList: LazyInjectEntry[] = [];
  private readonly instanceMap = new Map<Key, Instance>();
  constructor(controllers: ProviderOptions[], providers: ProviderOptions[]) {
    const list = [...controllers, ...providers];

    for (const opts of list) {
      Reflect.apply(lazyInjector.createInstance, this, [opts]);
    }

    this.apply();
  }

  /**
   * Need to be used by Reflect.apply(lazyInjector.createInstance)
   * - lazyInjector.createInstance calls `this.getProvide`
   * @param opts
   * @returns
   */
  private getProvide(opts: ProviderOptions) {
    return whether.isClass(opts) ? opts.name : opts.provide;
  }

  createInstanceByClass(token: Key, cls: Class) {
    return Reflect.apply(lazyInjector.createInstanceByClass, this, [token, cls]);
  }

  apply() {
    // & Special dealing
    this.instanceMap.set(APP_LOGGER, console);
    Reflect.apply(lazyInjector.apply, this, []);
  }

  get<T>(type: Class | Key): T {
    const token = whether.isKey(type) ? type : type.name;
    return this.instanceMap.get(token);
  }
}

export const Test = {
  createTestingModule({
    controllers = [],
    providers = [],
  }: {
    controllers?: ProviderOptions[];
    providers?: ProviderOptions[];
  }) {
    return {
      compile() {
        return new TestingModule(controllers, providers);
      },
    };
  },
};
