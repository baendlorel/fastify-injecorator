/* eslint-disable @typescript-eslint/no-explicit-any */

export type Func = (...args: any[]) => any;

export type Class<T = any> = new (...args: any) => T;

export type Key = string | symbol;

export type Satisfied = any;

export type OrPromise<T = void> = T | Promise<T>;
