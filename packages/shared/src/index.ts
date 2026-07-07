// Shared utilities and types
// This package contains common utilities used across all nestify-js packages

export * from './consts.js';

type ArrValue<T> = T extends readonly (infer U)[] ? U : never;

export const concatArr = <T extends readonly unknown[]>(...args: (T | undefined)[]) => {
  if (0 === args.length) {
    return [] as ArrValue<T>[];
  }
  return args.filter(Array.isArray).flat() as ArrValue<T>[];
};

export const toAssigned = (...args: (object | symbol | undefined)[]) =>
  Object.assign({}, ...args.filter((v) => v && typeof v === 'object'));
