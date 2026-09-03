/* eslint-disable @typescript-eslint/no-explicit-any */

export type OrPromise<T = void> = T | Promise<T>;

export type Constructor<T = any> = new (...args: any[]) => T;

export type AnyFunction = (...args: any[]) => any;

export type SSKey = string | symbol;
