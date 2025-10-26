import { inspect } from 'node:util';
import { Class, Instance, Key } from '@/types/primitive.js';
import { expectClass, expectFunction, expectKey, throws, isClass, isFunction } from '@/asserts/index.js';
import {
  InjectArg,
  ProviderOptions,
  ProviderUseClass,
  ProviderUseValue,
  ProviderUseFactory,
  ProviderUseExisting,
} from '@/types/injecorator.js';

namespace ph {
  export function match(
    opts: ProviderOptions,
    callbacks: {
      useClass?: (token: Key, cls: Class) => unknown;
      useValue?: (token: Key, value: Instance) => unknown;
      useFactory?: (token: Key, factory: (...instances: Instance[]) => Instance, inject: (Class | Key)[]) => unknown;
      useExisting?: (token: Key, existingToken: Key) => unknown;
    }
  ) {
    const { useClass, useExisting, useFactory, useValue } = callbacks;

    if (isClass(opts) && useClass) {
      return useClass(opts.name, opts);
    }

    const optsStr = inspect(opts);

    if (useClass) {
      opts = opts as ProviderUseClass;
      expectClass(opts.useClass, `ProviderOptions must have a valid useClass, got: ${optsStr}`);
      return useClass(opts.provide, opts.useClass);
    }

    if (useValue) {
      opts = opts as ProviderUseValue;
      return useValue(opts.provide, opts.useValue);
    }

    if (useFactory) {
      opts = opts as ProviderUseFactory;
      expectFunction(opts.useFactory, `ProviderOptions must have a valid useFactory, got: ${optsStr}`);
      return useFactory(opts.provide, opts.useFactory, opts.inject ?? []);
    }

    if (useExisting) {
      opts = opts as ProviderUseExisting;
      expectKey(opts.useExisting, `ProviderOptions must have a valid useExisting, got: ${optsStr}`);
      return useExisting(opts.provide, opts.useExisting);
    }

    throws(`ProviderOptions must have one of useClass/useValue/useFactory/useExisting, got: ${optsStr}`);
  }

  export function getToken(providerOptions: ProviderOptions) {
    const token = 'provide' in providerOptions ? providerOptions.provide : providerOptions.name;
    expectKey(token, `ProviderOptions must have a valid token, got '${providerOptions}'`);
    return token;
  }

  /**
   * Normalize the inject argument to a string/symbol/class name.
   * @param arg InjectArg
   * @returns  a token used by `lazyInjector.instanceMap`
   */
  export function getInjectToken(arg: InjectArg) {
    if (typeof arg === 'string') {
      return arg;
    }
    if (typeof arg === 'symbol') {
      return arg;
    }

    if (isClass(arg)) {
      return arg.name;
    }

    if (isFunction(arg)) {
      return arg().name;
    }

    throw throws('Cannot get inject token from argument: ' + String(arg));
  }

  export function getInjectTokenName(arg: InjectArg) {
    if (typeof arg === 'string') {
      return arg;
    }
    if (typeof arg === 'symbol') {
      return String(arg);
    }

    if (isClass(arg)) {
      return arg.name;
    }

    if (isFunction(arg)) {
      return arg().name;
    }
  }
}

export default ph;
