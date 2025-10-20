import { expect, whether } from '@/asserts/index.js';
import { inspect } from 'node:util';

class Provider {
  match(
    opts: ProviderOptions,
    callbacks: {
      useClass?: (token: Key, cls: Class) => unknown;
      useValue?: (token: Key, value: Instance) => unknown;
      useFactory?: (
        token: Key,
        factory: (...instances: Instance[]) => Instance,
        inject: (Class | Key)[]
      ) => unknown;
      useExisting?: (token: Key, existingToken: Key) => unknown;
    }
  ) {
    const { useClass, useExisting, useFactory, useValue } = callbacks;

    if (whether.isClass(opts) && useClass) {
      const r = useClass(opts.name, opts);
      return r;
    }

    const optsStr = inspect(opts);

    if ('useClass' in opts && useClass) {
      expect.isClass(opts.useClass, `ProviderOptions must have a valid useClass, got: ${optsStr}`);
      const r = useClass(opts.provide, opts.useClass);
      return r;
    }

    if ('useValue' in opts && useValue) {
      const r = useValue(opts.provide, opts.useValue);
      return r;
    }

    if ('useFactory' in opts && useFactory) {
      expect.isFunction(
        opts.useFactory,
        `ProviderOptions must have a valid useFactory, got: ${optsStr}`
      );
      const r = useFactory(opts.provide, opts.useFactory, opts.inject ?? []);
      return r;
    }

    if ('useExisting' in opts && useExisting) {
      expect.isKey(
        opts.useExisting,
        `ProviderOptions must have a valid useExisting, got: ${optsStr}`
      );
      const r = useExisting(opts.provide, opts.useExisting);
      return r;
    }

    expect.throws(
      `ProviderOptions must have one of useClass/useValue/useFactory/useExisting, got: ${optsStr}`
    );
  }

  getToken(providerOptions: ProviderOptions) {
    const token = 'provide' in providerOptions ? providerOptions.provide : providerOptions.name;
    expect.isKey(token, `ProviderOptions must have a valid token, got '${providerOptions}'`);
    return token;
  }

  /**
   * Normalize the inject argument to a string/symbol/class name.
   * @param arg InjectArg
   * @returns  a token used by `lazyInjector.instanceMap`
   */
  getInjectToken(arg: InjectArg) {
    if (typeof arg === 'string') {
      return arg;
    }
    if (typeof arg === 'symbol') {
      return arg;
    }

    if (whether.isClass(arg)) {
      return arg.name;
    }

    if (whether.isFunction(arg)) {
      return arg().name;
    }

    throw expect.throws('Cannot get inject token from argument: ' + String(arg));
  }

  getInjectTokenName(arg: InjectArg) {
    if (typeof arg === 'string') {
      return arg;
    }
    if (typeof arg === 'symbol') {
      return String(arg);
    }

    if (whether.isClass(arg)) {
      return arg.name;
    }

    if (whether.isFunction(arg)) {
      return arg().name;
    }
  }
}

const provider = new Provider();
export default provider;
