/* eslint-disable @typescript-eslint/no-explicit-any */

type Tuple<N extends number = 1, R extends any[] = []> = R['length'] extends N
  ? R
  : Tuple<N, [...R, any]>;

type EnsurePromise<T> = Promise<T extends Promise<any> ? Awaited<T> : T>;

/**
 * Means `T` or `Promise<T>`
 */
type OrPromise<T = void> = T | Promise<T>;

type ReplaceReturnType<F extends (...args: any) => any, T> = (...args: Parameters<F>) => T;
