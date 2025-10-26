import { inspect } from 'node:util';
import { ReflectDeep } from 'reflect-deep';
import { InjectArg, InjectToken } from '@/types/injecorator.js';
import { Sym } from '@/common/index.js';

import { eisClass, eisObject, throws } from './expect.js';
import { eisClassDecoratorContext } from './decorator-context.js';
import { wisInjectToken, wisInjectArg, wisProviderOptions, wisFunction } from './whether.js';

export const eisInjectToken: (o: any, msg?: string) => asserts o is InjectToken = (
  o,
  msg = 'Should be a string, symbol or class'
) => {
  if (!wisInjectToken(o)) {
    throws(msg);
  }
};

export const eorInjectToken: (o: any, msg?: string) => asserts o is InjectToken | undefined = (
  o,
  msg = 'Should be a string, symbol or class'
) => {
  if (o !== undefined && !wisInjectToken(o)) {
    throws(msg);
  }
};

export const eisRouted: (context: ClassMethodDecoratorContext) => void = (context) => {
  eisObject(
    ReflectDeep.get(context.metadata, [Sym.Root, Sym.Route, context.name]),
    'Should be decorated with route decorators(like @Post) first'
  );
};

export const eisInjectable: (
  target: Class,
  context: ClassDecoratorContext
) => asserts context is ClassDecoratorContext = (target, context) => {
  eisClass(target, '@Injectable/@Controller can only be used on classes');
  eisClassDecoratorContext(context);
  eisNotDecorated(context, Sym.Provider);
};

export const eisModule: (target: Class, context: ClassDecoratorContext) => asserts context is ClassDecoratorContext = (
  target,
  context
) => {
  eisClass(target, '@Module can only be used on classes');
  eisClassDecoratorContext(context);
  eisNotDecorated(context, Sym.Module);
};

export const eisNotDecorated: (context: DecoratorContext, flag: symbol) => void = (context, flag) => {
  if (ReflectDeep.has(context.metadata, [Sym.Root, flag])) {
    throws(`'${String(context.name)}' is already decorated`);
  }
};

export const eisClassNotDecorated: (cls: Class, flag: symbol) => void = (cls, flag) => {
  if (ReflectDeep.has(cls, [Sym.metadata, Sym.Root, flag])) {
    throws(`'${String(cls.name)}' is already decorated`);
  }
};

export const eisInjectArg: (target: InjectArg, msg?: string) => void = (target, msg = '') => {
  if (!wisInjectArg(target)) {
    throws(`${msg} Should be an InjectArg(string | symbol | Class | (() => Class)), got: ${inspect(target)}`);
  }
};

export const eisProviderOptions: (target: unknown) => void = (target) => {
  if (!wisProviderOptions(target)) {
    throws(`Should be a provider options object, got: ${inspect(target)}`);
  }
};

/**
 * Middleware class must at least have 1 hook implemented
 * @param target it is a Middleware class
 */
export const eisHasOneHook = <T>(target: Class<T>, hooks: (keyof T)[], msg: string): void => {
  const proto = target.prototype as T;
  eisObject(proto, 'Prototype should be an object');
  for (let i = 0; i < hooks.length; i++) {
    if (wisFunction(proto[hooks[i]])) {
      return;
    }
  }
  throws(msg);
};
