/* eslint-disable @typescript-eslint/no-explicit-any */

export type Func = (...args: any[]) => any;

export type Class<T = any> = new (...args: any) => T;

export type Instance = InstanceType<Class>;

export type Key = string | symbol;
