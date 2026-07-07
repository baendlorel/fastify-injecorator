import { Func } from '@nestify/shared';
import { expectBoolean, expectFunction, expectKey, expectObject, expectString, expect } from './expect.js';

export const expectClassDecoratorContext = (o: any, msg: string) => {
  expectObject<ClassDecoratorContext>(o, msg);
  expect(o.kind === 'class', msg);
  expectString(o.name, msg);
  expectFunction(o.addInitializer, msg);
  expectObject(o.metadata, msg);
};

export const expectClassMethodDecoratorContext = (o: any, msg: string) => {
  expectObject<ClassMethodDecoratorContext>(o, msg);
  expect(o.kind === 'method', msg);
  expectKey(o.name, msg);
  expectBoolean(o.static, msg);
  expectBoolean(o.private, msg);
  expectFunction(o.access?.has, msg);
  expectFunction(o.access?.get, msg);
  expectFunction(o.addInitializer, msg);
  expectObject(o.metadata, msg);
};

export const expectClassGetterDecoratorContext = (o: any, msg: string) => {
  expectObject<ClassGetterDecoratorContext>(o, msg);
  expect(o.kind === 'getter', msg);
  expectKey(o.name, msg);
  expectBoolean(o.static, msg);
  expectBoolean(o.private, msg);
  expectFunction(o.access?.has, msg);
  expectFunction(o.access?.get, msg);
  expectFunction(o.addInitializer, msg);
  expectObject(o.metadata, msg);
};

export const expectClassSetterDecoratorContext = (o: any, msg: string) => {
  expectObject<ClassSetterDecoratorContext>(o, msg);
  expect(o.kind === 'setter', msg);
  expectKey(o.name, msg);
  expectBoolean(o.static, msg);
  expectBoolean(o.private, msg);
  expectFunction(o.access?.has, msg);
  expectFunction(o.access?.set, msg);
  expectFunction(o.addInitializer, msg);
  expectObject(o.metadata, msg);
};

export const expectClassFieldDecoratorContext = (o: any, msg: string) => {
  expectObject<ClassFieldDecoratorContext>(o, msg);
  expect(o.kind === 'field', msg);
  expectKey(o.name, msg);
  expectBoolean(o.static, msg);
  expectBoolean(o.private, msg);
  expectFunction(o.access?.has, msg);
  expectFunction(o.access?.get, msg);
  expectFunction(o.access?.set, msg);
  expectFunction(o.addInitializer, msg);
  expectObject(o.metadata, msg);
};

export const expectClassAccessorDecoratorContext = (o: any, msg: string) => {
  expectObject<ClassAccessorDecoratorContext>(o, msg);
  expect(o.kind === 'accessor', msg);
  expectKey(o.name, msg);
  expectBoolean(o.static, msg);
  expectBoolean(o.private, msg);
  expectFunction(o.access?.has, msg);
  expectFunction(o.access?.get, msg);
  expectFunction(o.access?.set, msg);
  expectFunction(o.addInitializer, msg);
  expectObject(o.metadata, msg);
};

export const expectDecoratorContext = (o: any, msg: string) => {
  expectObject<DecoratorContext>(o, msg);
  expectKey(o.name, msg);
  expectFunction(o.addInitializer, msg);
  expectObject(o.metadata, msg);
};

export const expectMethodDecorator = (target: Func, context: ClassMethodDecoratorContext) => {
  expectFunction(target, 'Target should be a function');
  expectClassMethodDecoratorContext(context, 'Must be used on a class method');
};
