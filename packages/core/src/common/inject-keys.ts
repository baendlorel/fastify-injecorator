import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_LOGGER, APP_PIPE } from '@nestify/shared';
import { ProviderStandardOptions, ProviderOptions } from '@core/types/injecorator.js';
import { $get } from './native.js';

const tokenField: keyof ProviderStandardOptions = 'provide';

export function tryToGetGlobalToken(opts: ProviderOptions): symbol | null {
  const token = $get(Object(opts), tokenField);

  return token === APP_LOGGER ||
    token === APP_INTERCEPTOR ||
    token === APP_FILTER ||
    token === APP_GUARD ||
    token === APP_PIPE
    ? token
    : null;
}
