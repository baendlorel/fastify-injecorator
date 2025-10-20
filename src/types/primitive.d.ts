/* eslint-disable @typescript-eslint/no-explicit-any */

type PrimitiveType =
  | 'object'
  | 'function'
  | 'undefined'
  | 'symbol'
  | 'bigint'
  | 'boolean'
  | 'number'
  | 'string';

type PrimitiveTypeExt = PrimitiveType | 'class';

type Func = (...args: any[]) => any;

type Class<T = any> = new (...args: any) => T;

type AbstractClass = abstract new (...args: any) => any;

type Instance = InstanceType<Class>;

type DecoratorKind = 'class' | 'method' | 'getter' | 'setter' | 'field' | 'accessor';

type Key = string | symbol;
