/* eslint-disable @typescript-eslint/no-explicit-any */
// ! I created this file because the decorator type annotations need the types to be in current package, not @nestify-js/shared.

import type { sym } from '@nestify-js/shared';

export type OrPromise<T = void> = T | Promise<T>;

export type Constructor<T = any> = (new (...args: any[]) => T) & { [sym.metadata]: any };

export type AnyFunction = (...args: any[]) => any;

export type SSKey = string | symbol;
