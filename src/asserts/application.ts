import { inspect } from 'node:util';
import { ReflectDeep } from 'reflect-deep';
import { Class } from '@/types/primitive.js';
import { InjectArg } from '@/types/injecorator.js';
import { Sym } from '@/common/index.js';

import { expectClass, expectObject, throws } from './expect.js';
import { expectClassDecoratorContext } from './decorator-context.js';
import { wisInjectToken, wisInjectArg, wisProviderOptions, wisFunction } from './whether.js';

export const expectInjectToken = (o: any, msg: string) => {
  if (!wisInjectToken(o)) {
    throws(msg);
  }
};

export const expectRouted = (context: ClassMethodDecoratorContext) => {
  const o = ReflectDeep.get(context.metadata, [Sym.Root, Sym.Route, context.name]);
  expectObject(o, 'Should be decorated with route decorators(like @Post) first');
};

export const expectInjectable = (target: Class, context: ClassDecoratorContext) => {
  expectClass(target, '@Injectable/@Controller can only be used on classes');
  expectClassDecoratorContext(context, '@Injectable/@Controller can only be used on classes');
  expectNotDecorated(context, Sym.Provider);
};

export const expectModulable = (target: Class, context: ClassDecoratorContext) => {
  expectClass(target, '@Module can only be used on classes');
  expectClassDecoratorContext(context, '@Module can only be used on classes');
  expectNotDecorated(context, Sym.Module);
};

export const expectNotDecorated = (context: DecoratorContext, flag: symbol) => {
  if (ReflectDeep.has(context.metadata, [Sym.Root, flag])) {
    throws(`'${String(context.name)}' is already decorated`);
  }
};

export const expectClassNotDecorated = (cls: Class, flag: symbol) => {
  if (ReflectDeep.has(cls, [Sym.metadata, Sym.Root, flag])) {
    throws(`'${String(cls.name)}' is already decorated`);
  }
};

export const expectInjectArg = (target: InjectArg, msg?: string) => {
  if (!wisInjectArg(target)) {
    throws(`${msg} Should be an InjectArg(string | symbol | Class | (() => Class)), got: ${inspect(target)}`);
  }
};

export const expectProviderOptions = (target: unknown) => {
  if (!wisProviderOptions(target)) {
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
    if (wisFunction(proto[hooks[i]])) {
      return;
    }
  }
  throws(msg);
};
