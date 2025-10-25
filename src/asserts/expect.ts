/* eslint-disable @typescript-eslint/no-explicit-any */
import { inspect } from 'node:util';
import { ReflectDeep } from 'reflect-deep';
import { InjectArg, InjectToken } from '@/types/injecorator.js';
import { fnToString } from '@/common/native.js';

import { Sym } from '@/common/index.js';
import { whether } from './whether.js';
import { InjecoratorError } from './injecorator-error.class.js';

export const throws = (msg: string): never => {
  throw new InjecoratorError(msg);
};

// # Basic

export const dexpect = (target: any, msg: string): asserts target => {
  if (!target) {
    throws(msg);
  }
};

export const eincludes = (arr: any[], o: any, msg?: string) => {
  if (!arr.includes(o)) {
    throws(msg ?? `'${o}' should be one of [${arr.join(', ')}]`);
  }
};

export const eorString = (o: any, msg: string): asserts o is string | undefined => {
  if (o !== undefined && typeof o !== 'string') {
    throws(msg);
  }
};

export const eisString = (o: any, msg: string): asserts o is string | undefined => {
  if (typeof o !== 'string') {
    throws(msg);
  }
};

export const eorObject = (o: any, msg: string): asserts o is object | undefined => {
  if (o !== undefined && (typeof o !== 'object' || o === null)) {
    throws(msg);
  }
};

export const eisObject: (o: any, msg: string) => asserts o is object = (o, msg) => {
  if (typeof o !== 'object' || o === null) {
    throws(msg);
  }
};

export const eisKey = (o: any, msg: string): asserts o is InjectToken => {
  if (typeof o !== 'string' && typeof o !== 'symbol' && !whether.isClass(o)) {
    throws(msg);
  }
};

export const eisClass = (o: any, msg: string): asserts o is Class => {
  if (typeof o !== 'function') {
    throws(msg);
  }
  const str = fnToString.call(o);
  // & This is better than using pseudo calling
  if (!str.startsWith('class ') && !str.startsWith('[class ')) {
    throws(msg);
  }
};

export const eisBoolean = (o: any, msg: string): asserts o is boolean => {
  if (o !== true && o !== false) {
    throws(msg);
  }
};

export const eisUndefined = (o: any, msg: string): asserts o is undefined => {
  if (o !== undefined) {
    throws(msg);
  }
};

export const eisFunction = (o: any, msg: string): asserts o is Func => {
  if (typeof o !== 'function') {
    throws(msg);
  }
};

/**
 * Asserts that `arr` is an array.
 * - If `asserter` is provided, it will be called for each element in the array.
 *   - If it returns a string, it will throw an error with that message.
 *   - If it returns `null` or `undefined`, the element is considered valid.
 *   - If it returns `boolean` and value is `true`, the element is considered valid.
 */
export const eisArray = <T = any>(
  arr: any,
  msg: string,
  predicate?: (value: T, index: number, array: T[]) => void
): asserts arr is T[] => {
  if (!Array.isArray(arr)) {
    throw new InjecoratorError(msg);
  }

  if (predicate) {
    for (let i = 0; i < arr.length; i++) {
      predicate(arr[i], i, arr);
    }
  }
};

export const eisRecord: <V>(
  target: unknown,
  predicate: (value: V, key?: Key) => void,
  msg: string
) => asserts target is Record<Key, V> = (target, predicate, msg) => {
  eisObject(target, msg);
  for (const [key, value] of Object.entries(target)) {
    predicate(value, key);
  }
};

class UntypedExpecter extends Function {
  isInjectToken(o: any, msg: string = `Should be a string, symbol or class`): asserts o is InjectToken {
    if (!whether.isInjectToken(o)) {
      throw new InjecoratorError(msg);
    }
  }

  orInjectToken(o: any, msg: string = `Should be a string, symbol or class`): asserts o is InjectToken | undefined {
    if (o !== undefined && !whether.isInjectToken(o)) {
      throw new InjecoratorError(msg);
    }
  }

  // #region Decorator context assertions
  isClassDecoratorContext(o: any, msg = 'Should be a ClassDecoratorContext'): asserts o is ClassDecoratorContext {
    this.isObject<ClassDecoratorContext>(o, msg);
    this(o.kind === 'class', msg);
    this.isString(o.name, msg);
    this.isFunction(o.addInitializer, msg);
    this.isObject(o.metadata, msg);
  }

  isClassMethodDecoratorContext(
    o: any,
    msg = 'Should be a ClassMethodDecoratorContext'
  ): asserts o is ClassMethodDecoratorContext {
    this.isObject<ClassMethodDecoratorContext>(o, msg);
    this(o.kind === 'method', msg);
    this.isKey(o.name, msg);
    this.isBoolean(o.static, msg);
    this.isBoolean(o.private, msg);
    this.isFunction(o.access?.has, msg);
    this.isFunction(o.access?.get, msg);
    this.isFunction(o.addInitializer, msg);
    this.isObject(o.metadata, msg);
  }

  isClassGetterDecoratorContext(
    o: any,
    msg = 'Should be a ClassGetterDecoratorContext'
  ): asserts o is ClassGetterDecoratorContext {
    this.isObject<ClassGetterDecoratorContext>(o, msg);
    this(o.kind === 'getter', msg);
    this.isKey(o.name, msg);
    this.isBoolean(o.static, msg);
    this.isBoolean(o.private, msg);
    this.isFunction(o.access?.has, msg);
    this.isFunction(o.access?.get, msg);
    this.isFunction(o.addInitializer, msg);
    this.isObject(o.metadata, msg);
  }

  isClassSetterDecoratorContext(
    o: any,
    msg = 'Should be a ClassSetterDecoratorContext'
  ): asserts o is ClassSetterDecoratorContext {
    this.isObject<ClassSetterDecoratorContext>(o, msg);
    this(o.kind === 'setter', msg);
    this.isKey(o.name, msg);
    this.isBoolean(o.static, msg);
    this.isBoolean(o.private, msg);
    this.isFunction(o.access?.has, msg);
    this.isFunction(o.access?.set, msg);
    this.isFunction(o.addInitializer, msg);
    this.isObject(o.metadata, msg);
  }

  isClassFieldDecoratorContext(
    o: any,
    msg = 'Should be a ClassFieldDecoratorContext'
  ): asserts o is ClassFieldDecoratorContext {
    this.isObject<ClassFieldDecoratorContext>(o, msg);
    this(o.kind === 'field', msg);
    this.isKey(o.name, msg);
    this.isBoolean(o.static, msg);
    this.isBoolean(o.private, msg);
    this.isFunction(o.access?.has, msg);
    this.isFunction(o.access?.get, msg);
    this.isFunction(o.access?.set, msg);
    this.isFunction(o.addInitializer, msg);
    this.isObject(o.metadata, msg);
  }

  isClassAccessorDecoratorContext(
    o: any,
    msg = 'Should be a ClassAccessorDecoratorContext'
  ): asserts o is ClassAccessorDecoratorContext {
    this.isObject<ClassAccessorDecoratorContext>(o, msg);
    this(o.kind === 'accessor', msg);
    this.isKey(o.name, msg);
    this.isBoolean(o.static, msg);
    this.isBoolean(o.private, msg);
    this.isFunction(o.access?.has, msg);
    this.isFunction(o.access?.get, msg);
    this.isFunction(o.access?.set, msg);
    this.isFunction(o.addInitializer, msg);
    this.isObject(o.metadata, msg);
  }

  isDecoratorContext(o: any, msg = 'Should be a DecoratorContext'): asserts o is DecoratorContext {
    this.isObject<DecoratorContext>(o, msg);
    this(o.kind === 'accessor', msg);
    this.isKey(o.name, msg);
    this.isFunction(o.addInitializer, msg);
    this.isObject(o.metadata, msg);
  }
  // #endregion

  // #region Decorator Creation assertions
  methodDecorator(target: Func, context: ClassMethodDecoratorContext) {
    this.isFunction(target);
    this.isClassMethodDecoratorContext(context);
  }
  // #endregion

  // #region FastifyInjector assertions
  routed(context: ClassMethodDecoratorContext) {
    this.isObject(
      ReflectDeep.get(context.metadata, [Sym.Root, Sym.Route, context.name]),
      'Should be decorated with route decorators(like @Post) first'
    );
  }

  injectable(target: Class, context: ClassDecoratorContext): asserts context is ClassDecoratorContext {
    this.isClass(target, `@Injectable/@Controller can only be used on classes`);
    this.isClassDecoratorContext(context);
    this.notDecorated(context, Sym.Provider);
  }

  module(target: Class, context: ClassDecoratorContext): asserts context is ClassDecoratorContext {
    this.isClass(target, `@Module can only be used on classes`);
    this.isClassDecoratorContext(context);
    this.notDecorated(context, Sym.Module);
  }

  notDecorated(context: DecoratorContext, flag: symbol) {
    if (ReflectDeep.has(context.metadata, [Sym.Root, flag])) {
      throw new InjecoratorError(`'${String(context.name)}' is already decorated`);
    }
  }

  classNotDecorated(cls: Class, flag: symbol) {
    if (ReflectDeep.has(cls, [Sym.metadata, Sym.Root, flag])) {
      throw new InjecoratorError(`'${String(cls.name)}' is already decorated`);
    }
  }

  isInjectArg(target: InjectArg, msg: string = '') {
    if (!whether.isInjectArg(target)) {
      throw new InjecoratorError(
        `${msg} Should be an InjectArg(string | symbol | Class | (() => Class)), got: ${inspect(target)}`
      );
    }
  }

  isProviderOptions(target: unknown) {
    if (!whether.isProviderOptions(target)) {
      throw new InjecoratorError(`Should be a provider options object, got: ${inspect(target)}`);
    }
  }

  /**
   * Middleware class must at least have 1 hook implemented
   * @param target it is a Middleware class
   */
  hasOneHook<T>(target: Class<T>, hooks: (keyof T)[], msg: string) {
    const proto = target.prototype as T;
    this.isObject(proto);
    for (let i = 0; i < hooks.length; i++) {
      if (whether.isFunction(proto[hooks[i]])) {
        return;
      }
    }
    throw new InjecoratorError(msg);
  }
  // #endregion
}

type Expecter = ((target: any, msg: string) => asserts target) & UntypedExpecter;

/**
 * Expect the target to be truthy.
 * @param target anything to be asserted
 * @param msg message throws with error
 */
export const expect: Expecter = new UntypedExpecter() as Expecter;
