import { inspect } from 'node:util';
import { Constructable, Key } from '@nestify/shared';
import { expectClass, expectFunction, expectKey, _isConstructable, _isFunction } from '@core/asserts/index.js';
import {
  InjectArg,
  ProviderOptions,
  ProviderUseClass,
  ProviderUseValue,
  ProviderUseFactory,
  ProviderUseExisting,
} from '@core/types/injecorator.js';

namespace ph {
  export function match(
    opts: ProviderOptions,
    callbacks: {
      useClass?: (token: Key, cls: Constructable) => unknown;
      useValue?: (token: Key, value: InstanceType<Constructable>) => unknown;
      useFactory?: (
        token: Key,
        // TODO 实际上InstanceType<Class>就是any啊！
        factory: (...instances: InstanceType<Constructable>[]) => InstanceType<Constructable>,
        inject: (Constructable | Key)[],
      ) => unknown;
      useExisting?: (token: Key, existingToken: Key) => unknown;
    },
  ) {
    const { useClass, useExisting, useFactory, useValue } = callbacks;

    // Handle direct class provider
    if (_isConstructable(opts) && useClass) {
      return useClass(opts.name, opts);
    }

    const optsStr = inspect(opts);

    // Check actual provider type and call corresponding callback
    if ('useClass' in opts && useClass) {
      opts = opts as ProviderUseClass;
      expectClass(opts.useClass, `ProviderOptions must have a valid useClass, got: ${optsStr}`);
      return useClass(opts.provide, opts.useClass);
    }

    if ('useValue' in opts && useValue) {
      opts = opts as ProviderUseValue;
      return useValue(opts.provide, opts.useValue);
    }

    if ('useFactory' in opts && useFactory) {
      opts = opts as ProviderUseFactory;
      expectFunction(opts.useFactory, `ProviderOptions must have a valid useFactory, got: ${optsStr}`);
      return useFactory(opts.provide, opts.useFactory, opts.inject ?? []);
    }

    if ('useExisting' in opts && useExisting) {
      opts = opts as ProviderUseExisting;
      expectKey(opts.useExisting, `ProviderOptions must have a valid useExisting, got: ${optsStr}`);
      return useExisting(opts.provide, opts.useExisting);
    }

    _throw(`ProviderOptions must have one of useClass/useValue/useFactory/useExisting, got: ${optsStr}`);
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

    if (_isConstructable(arg)) {
      return arg.name;
    }

    if (_isFunction(arg)) {
      return arg().name;
    }

    _throw('Cannot get inject token from argument: ' + String(arg));
  }

  export function getInjectTokenName(arg: InjectArg) {
    if (typeof arg === 'string') {
      return arg;
    }
    if (typeof arg === 'symbol') {
      return String(arg);
    }

    if (_isConstructable(arg)) {
      return arg.name;
    }

    if (_isFunction(arg)) {
      return arg().name;
    }
  }
}

export default ph;
