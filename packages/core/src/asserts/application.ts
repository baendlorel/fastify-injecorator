import { inspect } from 'node:util';
import { ReflectDeep } from 'reflect-deep';
import { Class } from '@core/types/primitive.js';
import { InjectArg } from '@core/types/injecorator.js';
import { sym } from '@core/common/index.js';

import { expectClass, expectObject, throws } from './expect.js';
import { expectClassDecoratorContext } from './decorator-context.js';
import { isInjectToken, isInjectArg, isProviderOptions, isFunction } from './whether.js';

export const expectInjectToken = (o: any, msg: string) => {
  if (!isInjectToken(o)) {
    throws(msg);
  }
};

export const expectRouted = (context: ClassMethodDecoratorContext) => {
  const o = ReflectDeep.get(context.metadata, [sym.root, sym.route.root, context.name]);
  expectObject(o, 'Should be decorated with route decorators(like @Post) first');
};

export const expectInjectable = (target: Class, context: ClassDecoratorContext) => {
  expectClass(target, '@Injectable/@Controller can only be used on classes');
  expectClassDecoratorContext(context, '@Injectable/@Controller can only be used on classes');
  expectNotDecorated(context, sym.provider);
};

export const expectModulable = (target: Class, context: ClassDecoratorContext) => {
  expectClass(target, '@Module can only be used on classes');
  expectClassDecoratorContext(context, '@Module can only be used on classes');
  expectNotDecorated(context, sym.module);
};

export const expectNotDecorated = (context: DecoratorContext, flag: symbol) => {
  if (ReflectDeep.has(context.metadata, [sym.root, flag])) {
    throws(`'${String(context.name)}' is already decorated`);
  }
};

export const expectClassNotDecorated = (cls: Class, flag: symbol) => {
  if (ReflectDeep.has(cls, [sym.metadata, sym.root, flag])) {
    throws(`'${String(cls.name)}' is already decorated`);
  }
};

export const expectInjectArg = (target: InjectArg, msg?: string) => {
  if (!isInjectArg(target)) {
    throws(`${msg} Should be an InjectArg(string | symbol | Class | (() => Class)), got: ${inspect(target)}`);
  }
};

export const expectProviderOptions = (target: unknown) => {
  if (!isProviderOptions(target)) {
    throws(`Should be a provider options object, got: ${inspect(target)}`);
  }
};

/**
 * Middleware class must at least have 1 hook implemented
 * @param target it is a Middleware class
 */
export const expectHasOneHook = <T>(target: Class<T>, hooks: (keyof T)[], msg: string): void => {
  const proto = target.prototype as T;
  expectObject(proto, 'Prototype should be an object');
  for (let i = 0; i < hooks.length; i++) {
    if (isFunction(proto[hooks[i]])) {
      return;
    }
  }
  throws(msg);
};
