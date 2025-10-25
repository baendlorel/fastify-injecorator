import { eisBoolean, eisFunction, eisKey, eisObject, eisString, expect } from './expect.js';

export const eisClassDecoratorContext: (o: any, msg?: string) => asserts o is ClassDecoratorContext = (
  o,
  msg = 'Should be a ClassDecoratorContext'
) => {
  eisObject<ClassDecoratorContext>(o, msg);
  expect(o.kind === 'class', msg);
  eisString(o.name, msg);
  eisFunction(o.addInitializer, msg);
  eisObject(o.metadata, msg);
};

export const eisClassMethodDecoratorContext: (o: any, msg?: string) => asserts o is ClassMethodDecoratorContext = (
  o,
  msg = 'Should be a ClassMethodDecoratorContext'
) => {
  eisObject<ClassMethodDecoratorContext>(o, msg);
  expect(o.kind === 'method', msg);
  eisKey(o.name, msg);
  eisBoolean(o.static, msg);
  eisBoolean(o.private, msg);
  eisFunction(o.access?.has, msg);
  eisFunction(o.access?.get, msg);
  eisFunction(o.addInitializer, msg);
  eisObject(o.metadata, msg);
};

export const eisClassGetterDecoratorContext: (o: any, msg?: string) => asserts o is ClassGetterDecoratorContext = (
  o,
  msg = 'Should be a ClassGetterDecoratorContext'
) => {
  eisObject<ClassGetterDecoratorContext>(o, msg);
  expect(o.kind === 'getter', msg);
  eisKey(o.name, msg);
  eisBoolean(o.static, msg);
  eisBoolean(o.private, msg);
  eisFunction(o.access?.has, msg);
  eisFunction(o.access?.get, msg);
  eisFunction(o.addInitializer, msg);
  eisObject(o.metadata, msg);
};

export const eisClassSetterDecoratorContext: (o: any, msg?: string) => asserts o is ClassSetterDecoratorContext = (
  o,
  msg = 'Should be a ClassSetterDecoratorContext'
) => {
  eisObject<ClassSetterDecoratorContext>(o, msg);
  expect(o.kind === 'setter', msg);
  eisKey(o.name, msg);
  eisBoolean(o.static, msg);
  eisBoolean(o.private, msg);
  eisFunction(o.access?.has, msg);
  eisFunction(o.access?.set, msg);
  eisFunction(o.addInitializer, msg);
  eisObject(o.metadata, msg);
};

export const eisClassFieldDecoratorContext: (o: any, msg?: string) => asserts o is ClassFieldDecoratorContext = (
  o,
  msg = 'Should be a ClassFieldDecoratorContext'
) => {
  eisObject<ClassFieldDecoratorContext>(o, msg);
  expect(o.kind === 'field', msg);
  eisKey(o.name, msg);
  eisBoolean(o.static, msg);
  eisBoolean(o.private, msg);
  eisFunction(o.access?.has, msg);
  eisFunction(o.access?.get, msg);
  eisFunction(o.access?.set, msg);
  eisFunction(o.addInitializer, msg);
  eisObject(o.metadata, msg);
};

export const eisClassAccessorDecoratorContext: (o: any, msg?: string) => asserts o is ClassAccessorDecoratorContext = (
  o,
  msg = 'Should be a ClassAccessorDecoratorContext'
) => {
  eisObject<ClassAccessorDecoratorContext>(o, msg);
  expect(o.kind === 'accessor', msg);
  eisKey(o.name, msg);
  eisBoolean(o.static, msg);
  eisBoolean(o.private, msg);
  eisFunction(o.access?.has, msg);
  eisFunction(o.access?.get, msg);
  eisFunction(o.access?.set, msg);
  eisFunction(o.addInitializer, msg);
  eisObject(o.metadata, msg);
};

export const eisDecoratorContext: (o: any, msg?: string) => asserts o is DecoratorContext = (
  o,
  msg = 'Should be a DecoratorContext'
) => {
  eisObject<DecoratorContext>(o, msg);
  expect(o.kind === 'accessor', msg);
  eisKey(o.name, msg);
  eisFunction(o.addInitializer, msg);
  eisObject(o.metadata, msg);
};

export const eisMethodDecorator: (target: Func, context: ClassMethodDecoratorContext) => void = (target, context) => {
  eisFunction(target, 'Target should be a function');
  eisClassMethodDecoratorContext(context);
};
