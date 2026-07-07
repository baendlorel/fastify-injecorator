import type { Class, Func } from '@core/types/primitive.js';
import type { InjecoratorPipe, PipeOptions, PipeSchema, PipeFullSchema } from '@core/types/middleware.js';
import { _assign } from '@nestify/shared';

import {
  expectHasOneHook,
  expectInjectToken,
  expectObject,
  expectOrObject,
  expect,
  isClass,
  isKey,
} from '@core/asserts/index.js';
import { metaSetPipe, metaIsPipe, metaSetUsePipes } from '@core/register/meta.js';

import { Injectable } from '../injectable.js';
import { expectMiddleware } from './expect-middleware.js';

// preset pipes
import { PipeBody } from './pipes/body.pipe.js';
import { PipeParams } from './pipes/params.pipe.js';
import { PipeQuery } from './pipes/query.pipe.js';
import { PipeIp } from './pipes/ip.pipe.js';
import { PipeRaw } from './pipes/raw.pipe.js';
import { isBasicPipe } from './pipes/is-basic-pipe.js';

const hooks: (keyof InjecoratorPipe)[] = ['transform'];
export function Pipe() {
  return function (target: Class, context: ClassDecoratorContext) {
    expectHasOneHook<InjecoratorPipe>(
      target,
      hooks,
      `Pipe class must implement at least one hook: [${hooks.join(', ')}]`,
    );
    // Same as Injectable, so it can be registered as a provider
    Injectable()(target, context);
    metaSetPipe(context);
  };
}

function predicate(opts: PipeOptions) {
  expectObject(opts, 'Pipe options must be an object');
  const { schema, pipe } = opts;
  expectOrObject(schema, 'Pipe options.schema must be an object or omitted');
  expectInjectToken(pipe, 'Pipe options.pipe must be a string/symbol/class or omitted');
  const validPipe = isBasicPipe(pipe) || (isClass(pipe) && metaIsPipe(pipe)) || isKey(pipe);
  expect(validPipe, 'Pipe options.pipe must be a string/symbol/PipeClass');
}

/**
 * Similar to Pipes in NestJS but with different implementation
 * - `fastify.setValidatorCompiler` will be used for validation
 * - Can be used on Controllers and Handlers in Controllers
 * - Pipe is designed for http requests/replies, so it will not work on Injectables(Although there will not be any errors)
 * @param pipes PipeOptions or PipeClass
 */
export function UsePipes(...pipes: (PipeOptions | Class)[]) {
  expect(pipes.length > 0, '@UsePipes requires at least one pipe option or pipe class');
  const normalized = pipes.map((pipe) => (isClass(pipe) ? { pipe } : pipe));
  normalized.forEach(predicate);

  return function (target: Class | Func, context: ClassDecoratorContext | ClassMethodDecoratorContext) {
    expectMiddleware([], target, context);

    metaSetUsePipes(context, normalized);
  };
}

function mergeSchema(
  field: 'body' | 'params' | 'querystring',
  input?: PipeSchema,
  ok?: PipeSchema,
  other?: PipeFullSchema,
) {
  const o = {} as { body?: unknown; params?: unknown; querystring?: unknown; response?: unknown };
  if (input !== undefined) {
    o[field] = input;
  }
  if (ok !== undefined) {
    o.response = { 200: ok };
  }
  return _assign(o, other);
}

/**
 * Decorated method will be called with `handler(request.body, reply)
 * - `fastify.setValidatorCompiler` will be used for validation
 * @param input The pipe will validate `body` against this schema, using `validatorCompiler`(if it is provided too)
 * - Only the schema of the **FIRST** `PipeOption` will be mounted to `schema.body` to provide swagger info
 * @param ok will be set to `{ response: { 200: okSchema } }`
 * @param other The rest schemas like we set in `fastify.route({ schema })`
 */
export function Body(input?: PipeSchema, ok?: PipeSchema, other?: PipeFullSchema) {
  return UsePipes({ pipe: PipeBody, schema: mergeSchema('body', input, ok, other) });
}

/**
 * Decorated method will be called with `handler(request.params, reply)
 * - `fastify.setValidatorCompiler` will be used for validation
 * @param input The pipe will validate `params` against this schema, using `validatorCompiler`(if it is provided too)
 * - Only the schema of the **FIRST** `PipeOption` will be mounted to `schema.params` to provide swagger info
 * @param ok will be set to `{ response: { 200: okSchema } }`
 * @param other The rest schemas like we set in `fastify.route({ schema })`
 */
export function Params(input?: PipeSchema, ok?: PipeSchema, other?: PipeFullSchema) {
  return UsePipes({ pipe: PipeParams, schema: mergeSchema('params', input, ok, other) });
}

/**
 * Decorated method will be called with `handler(request.query, reply)
 * - `fastify.setValidatorCompiler` will be used for validation
 * @param input The pipe will validate `query` against this schema, using `validatorCompiler`(if it is provided too)
 * - Only the schema of the **FIRST** `PipeOption` will be mounted to `schema.querystring` to provide swagger info
 * @param ok will be set to `{ response: { 200: okSchema } }`
 * @param other The rest schemas like we set in `fastify.route({ schema })`
 */
export function Query(input?: PipeSchema, ok?: PipeSchema, other?: PipeFullSchema) {
  return UsePipes({ pipe: PipeQuery, schema: mergeSchema('querystring', input, ok, other) });
}

/**
 * Decorated method will be called with `handler(request.raw, reply)
 */
export function Raw() {
  return UsePipes({ pipe: PipeRaw });
}

/**
 * Decorated method will be called with `handler(request.ip, reply)
 */
export function Ip() {
  return UsePipes({ pipe: PipeIp });
}
