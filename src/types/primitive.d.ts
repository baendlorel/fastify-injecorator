/* eslint-disable @typescript-eslint/no-explicit-any */

type Func = (...args: any[]) => any;

type Class<T = any> = new (...args: any) => T;

type Instance = InstanceType<Class>;

type Key = string | symbol;
