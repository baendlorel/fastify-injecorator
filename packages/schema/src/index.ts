// Schema validation utilities
// This package provides Zod integration and validation utilities for nestify-js

// Preset pipe decorators
export { Body, Params, Query, Raw, Ip } from './decorators/pipe.js';

// Preset pipe classes
export { PipeBody } from './pipes/body.pipe.js';
export { PipeParams } from './pipes/params.pipe.js';
export { PipeQuery } from './pipes/query.pipe.js';
export { PipeIp } from './pipes/ip.pipe.js';
export { PipeRaw } from './pipes/raw.pipe.js';
export { isBasicPipe } from './pipes/is-basic-pipe.js';

// Validation engine
export { BasicTransformer, basicTransformer } from './pipes/basic-transformer.js';

// Setup helper
export { setupBasicPipes } from './setup.js';

// Zod integration
export {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from './zod.js';
