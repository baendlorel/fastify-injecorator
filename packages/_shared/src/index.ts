// Shared utilities and types
// This package contains common utilities used across all injecorator packages

export type {};

export const concatArr = (...args: unknown[][]) => {
  if (0 === args.length) {
    return [];
  }
  return args.filter(Array.isArray).flat();
};
