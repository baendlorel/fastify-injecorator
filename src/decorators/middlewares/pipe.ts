/* eslint-disable @typescript-eslint/no-explicit-any */
import { toAssigned } from 'to-assigned';
import { InjecoratorPipe, PipeOptions, PipeSchema, PipeFullSchema } from '@/types/middleware.js';
import { Sym } from '@/common/sym.js';
import { expect, whether } from '@/asserts/index.js';
import meta from '@/register/meta.js';

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
    expect.hasOneHook<InjecoratorPipe>(
      target,
      hooks,
      `Pipe class must implement at least one hook: [${hooks.join(', ')}]`
    );
    // Same as Injectable, so it can be registered as a provider
    Injectable()(target, context);
    meta.setPipe(context);
  };
}

function predicate(opts: PipeOptions) {
  expect.isObject(opts, 'Pipe options must be an object');
  const { schema = Sym.NotProvided, pipe } = opts;
  if (schema !== Sym.NotProvided) {
    expect.orObject(schema, 'Pipe options.schema must be an object or omitted');
  }
  expect.isInjectToken(pipe, 'Pipe options.pipe must be a string/symbol/class or omitted');
  const validPipe = isBasicPipe(pipe) || (whether.isClass(pipe) && meta.isPipe(pipe)) || whether.isKey(pipe);
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
  const normalized = pipes.map((pipe) => (whether.isClass(pipe) ? { pipe } : pipe));
  normalized.forEach(predicate);

  return function (target: Class | Func, context: ClassDecoratorContext | ClassMethodDecoratorContext) {
    expectMiddleware([], target, context);

    meta.setUsePipes(context, normalized);
  };
}

/**
 * Decorated method will be called with `handler(request.body, reply)
 * - `fastify.setValidatorCompiler` will be used for validation
 * @param inputSchema The pipe will validate `body` against this schema, using `validatorCompiler`(if it is provided too)
 * - Only the schema of the **FIRST** `PipeOption` will be mounted to `schema.body` to provide swagger info
 * @param okSchema will be set to `{ response: { 200: okSchema } }`
 * @param otherSchema The rest schemas like we set in `fastify.route({ schema })`
 */
export function Body(
  inputSchema: PipeSchema = Sym.NotProvided,
  okSchema: PipeSchema = Sym.NotProvided,
  otherSchema: PipeFullSchema = Sym.NotProvided as any
) {
  return UsePipes({
    pipe: PipeBody,
    schema: toAssigned(
      Sym.provide(otherSchema, null),
      Sym.provide(okSchema, null, { response: { 200: okSchema } }),
      Sym.provide(inputSchema, null, { body: inputSchema })
    ),
  });
}

/**
 * Decorated method will be called with `handler(request.params, reply)
 * - `fastify.setValidatorCompiler` will be used for validation
 * @param inputSchema The pipe will validate `params` against this schema, using `validatorCompiler`(if it is provided too)
 * - Only the schema of the **FIRST** `PipeOption` will be mounted to `schema.params` to provide swagger info
 * @param okSchema will be set to `{ response: { 200: okSchema } }`
 * @param otherSchema The rest schemas like we set in `fastify.route({ schema })`
 */
export function Params(
  inputSchema: PipeSchema = Sym.NotProvided,
  okSchema: PipeSchema = Sym.NotProvided,
  otherSchema: PipeFullSchema = Sym.NotProvided as any
) {
  return UsePipes({
    pipe: PipeParams,
    schema: toAssigned(
      Sym.provide(otherSchema, null),
      Sym.provide(okSchema, null, { response: { 200: okSchema } }),
      Sym.provide(inputSchema, null, { params: inputSchema })
    ),
  });
}

/**
 * Decorated method will be called with `handler(request.query, reply)
 * - `fastify.setValidatorCompiler` will be used for validation
 * @param inputSchema The pipe will validate `query` against this schema, using `validatorCompiler`(if it is provided too)
 * - Only the schema of the **FIRST** `PipeOption` will be mounted to `schema.querystring` to provide swagger info
 * @param okSchema will be set to `{ response: { 200: okSchema } }`
 * @param otherSchema The rest schemas like we set in `fastify.route({ schema })`
 */
export function Query(
  inputSchema: PipeSchema = Sym.NotProvided,
  okSchema: PipeSchema = Sym.NotProvided,
  otherSchema: PipeFullSchema = Sym.NotProvided as any
) {
  return UsePipes({
    pipe: PipeQuery,
    schema: toAssigned(
      Sym.provide(otherSchema, null),
      Sym.provide(okSchema, null, { response: { 200: okSchema } }),
      Sym.provide(inputSchema, null, { querystring: inputSchema })
    ),
  });
}

/**
 * Decorated method will be called with `handler(request.raw, reply)
 */
export function Raw() {
  return UsePipes({
    pipe: PipeRaw,
  });
}

/**
 * Decorated method will be called with `handler(request.ip, reply)
 */
export function Ip() {
  return UsePipes({
    pipe: PipeIp,
  });
}
