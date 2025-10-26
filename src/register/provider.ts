import { inspect } from 'node:util';
import { eisClass, eisFunction, eisKey, throws, wisClass, wisFunction } from '@/asserts/index.js';
import {
  InjectArg,
  ProviderOptions,
  ProviderUseClass,
  ProviderUseValue,
  ProviderUseFactory,
  ProviderUseExisting,
} from '@/types/injecorator.js';

class Provider {
  match(
    opts: ProviderOptions,
    callbacks: {
      useClass?: (token: Key, cls: Class) => unknown;
      useValue?: (token: Key, value: Instance) => unknown;
      useFactory?: (token: Key, factory: (...instances: Instance[]) => Instance, inject: (Class | Key)[]) => unknown;
      useExisting?: (token: Key, existingToken: Key) => unknown;
    }
  ) {
    const { useClass, useExisting, useFactory, useValue } = callbacks;

    if (wisClass(opts) && useClass) {
      return useClass(opts.name, opts);
    }

    const optsStr = inspect(opts);

    if (useClass) {
      opts = opts as ProviderUseClass;
      eisClass(opts.useClass, `ProviderOptions must have a valid useClass, got: ${optsStr}`);
      return useClass(opts.provide, opts.useClass);
    }

    if (useValue) {
      opts = opts as ProviderUseValue;
      return useValue(opts.provide, opts.useValue);
    }

    if (useFactory) {
      opts = opts as ProviderUseFactory;
      eisFunction(opts.useFactory, `ProviderOptions must have a valid useFactory, got: ${optsStr}`);
      return useFactory(opts.provide, opts.useFactory, opts.inject ?? []);
    }

    if (useExisting) {
      opts = opts as ProviderUseExisting;
      eisKey(opts.useExisting, `ProviderOptions must have a valid useExisting, got: ${optsStr}`);
      return useExisting(opts.provide, opts.useExisting);
    }

    throws(`ProviderOptions must have one of useClass/useValue/useFactory/useExisting, got: ${optsStr}`);
  }

  getToken(providerOptions: ProviderOptions) {
    const token = 'provide' in providerOptions ? providerOptions.provide : providerOptions.name;
    eisKey(token, `ProviderOptions must have a valid token, got '${providerOptions}'`);
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

    if (wisClass(arg)) {
      return arg.name;
    }

    if (wisFunction(arg)) {
      return arg().name;
    }

    throw throws('Cannot get inject token from argument: ' + String(arg));
  }

  getInjectTokenName(arg: InjectArg) {
    if (typeof arg === 'string') {
      return arg;
    }
    if (typeof arg === 'symbol') {
      return String(arg);
    }

    if (wisClass(arg)) {
      return arg.name;
    }

    if (wisFunction(arg)) {
      return arg().name;
    }
  }
}

/**
 * Provider helpers
 */
const ph = new Provider();
export default ph;
