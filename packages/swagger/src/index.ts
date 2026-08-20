// Swagger/OpenAPI integration
// This package provides API documentation decorators and Swagger setup

export { ApiSchema } from './decorators/api-schema.js';
export type { RouteApiSchema } from '@nestify-js/core';
export { setupSwagger } from './setup.js';
export type { SwaggerSetupOptions } from './setup.js';
