/* eslint-disable @typescript-eslint/no-explicit-any */
import { inspect } from 'node:util';
import { ReflectDeep } from 'reflect-deep';
import { InjectArg, InjectToken } from '@/types/injecorator.js';

import { Sym } from '@/common/index.js';
import { whether } from './whether.js';
import { InjecoratorError } from './injecorator-error.class.js';

/**
 * It is impossible to type the expecter as an assert function.
 * So we should do it manually blow the class definition.
 */
class UntypedExpecter extends Function {
  constructor() {
    const fstr = `if(!o){\ne=Error(m);\ne.name='__NAME__';throw e}`;
    super('o', 'm', fstr);
  }

  throws(msg: string) {
    return new InjecoratorError(msg);
  }

  // #region Common assertions
  includes(arr: any[], o: any, msg?: string) {
    if (!arr.includes(o)) {
      throw new InjecoratorError(msg ?? `'${o}' should be one of [${arr.join(', ')}]`);
    }
  }

  has(o: any, keys: Key[], msg?: string) {
    const hasnt: Key[] = [];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!Reflect.has(o, k)) {
        hasnt.push(k);
      }
    }
    if (hasnt.length > 0) {
      const hasntKeys = hasnt.map((k) => String(k)).join(', ');
      throw new InjecoratorError(msg ?? `'${o}' should has property ${hasntKeys}`);
    }
  }

  orString(o: any, msg?: string): asserts o is string | undefined {
    if (o !== undefined && typeof o !== 'string') {
      throw new InjecoratorError(msg ?? 'Should be a string or left it undefined');
    }
  }

  isString(o: any, msg = 'Should be a string'): asserts o is string {
    if (typeof o !== 'string') {
      throw new InjecoratorError(msg);
    }
  }

  orObject<T extends object>(o: any, msg = 'Should be an object'): asserts o is T | undefined {
    if (o !== undefined && (typeof o !== 'object' || o === null)) {
      throw new InjecoratorError(msg);
    }
  }

  isObject<T extends object>(o: any, msg = 'Should be an object'): asserts o is T {
    if (typeof o !== 'object' || o === null) {
      throw new InjecoratorError(msg);
    }
  }

  isKey(o: any, msg = 'Should be string/symbol'): asserts o is Key {
    if (typeof o !== 'string' && typeof o !== 'symbol') {
      throw new InjecoratorError(msg);
    }
  }

  isClass(o: any, msg = 'Should be a class/constructor'): asserts o is Class {
    if (typeof o !== 'function') {
      throw new InjecoratorError(msg);
    }
    try {
      // No side effects, just to check if it is a class
      new new Proxy(o, { construct: () => ({}) })();
    } catch {
      throw new InjecoratorError(msg);
    }
  }

  orClass(o: any, msg = 'Should be an object'): asserts o is Class | undefined {
    if (o !== undefined) {
      this.isClass(o, msg);
    }
  }

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

  isBoolean(o: any, msg = 'Should be a boolean value'): asserts o is boolean {
    if (o !== true && o !== false) {
      throw new InjecoratorError(msg);
    }
  }

  isUndefined(o: any, msg = 'Should be undefined'): asserts o is undefined {
    if (o !== undefined) {
      throw new InjecoratorError(msg);
    }
  }

  isFunction(o: any, msg = 'Should be a function'): asserts o is Func {
    if (typeof o !== 'function') {
      throw new InjecoratorError(msg);
    }
  }

  /**
   * Asserts that `arr` is an array.
   * - If `asserter` is provided, it will be called for each element in the array.
   *   - If it returns a string, it will throw an error with that message.
   *   - If it returns `null` or `undefined`, the element is considered valid.
   *   - If it returns `boolean` and value is `true`, the element is considered valid.
   * @param arr target array
   * @param asserter function to validate each element
   * @param msg
   */
  isArray<T = any>(
    arr: any,
    asserter?: (value: T, index?: number, array?: T[]) => void,
    msg = 'Should be an array'
  ): asserts arr is T[] {
    if (!Array.isArray(arr)) {
      throw new InjecoratorError(msg);
    }

    if (!asserter) {
      return;
    }

    for (let i = 0; i < arr.length; i++) {
      asserter(arr[i], i, arr);
    }
  }

  isAnyArray(arr: any, msg = 'Should be an array'): asserts arr is any[] {
    if (!Array.isArray(arr)) {
      throw new InjecoratorError(msg);
    }
  }

  record<V>(target: unknown, asserter: (value: V, key?: Key) => void, msg: string): asserts target is Record<Key, V> {
    this.isObject(target, msg);
    Object.entries(target).forEach((entry) => asserter(entry[1], entry[0]));
  }

  // #endregion

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
