// router decorators
export { Delete, Get, Patch, Post, Put, HttpMethod } from './decorators/router/http-methods.js';
export { Opt } from './decorators/router/opt.js';
export { ApiSchema } from './decorators/router/api-schema.js';
export { Controller } from './decorators/router/controller.js';
export { Body, Params, Query, Raw, Ip } from './decorators/middlewares/pipe.js';

export { Inject } from './decorators/inject.js';
export { Injectable } from './decorators/injectable.js';
export { createCustomDecorator, getCustomClassMetadata, getCustomMethodMetadata } from './decorators/custom.js';
export { Module, toModule } from './decorators/module.js';

// middlewares
export { Guard } from './decorators/middlewares/guard.js';
export { Interceptor } from './decorators/middlewares/interceptor.js';
export { Pipe } from './decorators/middlewares/pipe.js';
export { Filter } from './decorators/middlewares/filter.js';

export { UseGuards } from './decorators/middlewares/guard.js';
export { UseInterceptors } from './decorators/middlewares/interceptor.js';
export { UsePipes } from './decorators/middlewares/pipe.js';
export { UseFilters } from './decorators/middlewares/filter.js';

// export common exceptions for use
export * from './exceptions/index.js';
export { HttpStatus } from './common/status.js';
export { ExecutionContext } from './common/execution-context.js';

// multipart/file upload support (requires @fastify/multipart peer dependency)
export { File, Files, PipeFile, UploadedFile } from './multipart/index.js';
export type { MultipartFile, FileUploadOptions, FileUploadMeta } from './types/multipart.js';

// JWT authentication support
export { JwtService, JwtGuard } from './auth/index.js';
export type { JwtPayload, JwtSignOptions, JwtVerifyOptions, JwtModuleOptions } from './types/auth.js';
