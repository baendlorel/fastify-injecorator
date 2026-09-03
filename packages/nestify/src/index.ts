// Main Fastify integration package
// Re-exports core and swagger for all-in-one usage

export * from '@nestify-js/core';
export { HttpStatus } from '@nestify-js/shared';

// common keys
export { APP_LOGGER, APP_INTERCEPTOR, APP_FILTER, APP_GUARD, APP_PIPE } from '@nestify-js/shared';
