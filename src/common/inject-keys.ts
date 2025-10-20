import { ProviderStandardOptions, ProviderOptions } from '@/types/injecorator.js';

export const APP_LOGGER = Symbol('APP_LOGGER');
export const APP_INTERCEPTOR = Symbol('APP_INTERCEPTOR');
export const APP_FILTER = Symbol('APP_FILTER');
export const APP_GUARD = Symbol('APP_GUARD');
export const APP_PIPE = Symbol('APP_PIPE');

const tokenField: keyof ProviderStandardOptions = 'provide';

export function tryToGetGlobalToken(opts: ProviderOptions): symbol | null {
  const token = Reflect.get(Object(opts), tokenField);

  return token === APP_LOGGER ||
    token === APP_INTERCEPTOR ||
    token === APP_FILTER ||
    token === APP_GUARD ||
    token === APP_PIPE
    ? token
    : null;
}
