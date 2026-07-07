// Main Fastify integration package
// This re-exports core functionality and adds Fastify-specific features

export * from '@nestify/core';
export { HttpStatus } from '@nestify/shared';

// common keys
export { APP_LOGGER, APP_INTERCEPTOR, APP_FILTER, APP_GUARD, APP_PIPE } from '@nestify/shared';
