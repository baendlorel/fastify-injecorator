import {
  ContextConfigDefault,
  FastifyBaseLogger,
  FastifySchema,
  FastifyTypeProvider,
  FastifyTypeProviderDefault,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
  RouteGenericInterface,
  RouteShorthandOptions,
} from 'fastify';
import { Sym } from '@/common/index.js';

export type RouteOptType<
  RawServer extends RawServerBase = RawServerDefault,
  RawRequest extends
    RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
  RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
  TypeProvider extends FastifyTypeProvider = FastifyTypeProviderDefault,
  Logger extends FastifyBaseLogger = FastifyBaseLogger,
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  ContextConfig = ContextConfigDefault,
  SchemaCompiler extends FastifySchema = FastifySchema,
> = RouteShorthandOptions<
  RawServer,
  RawRequest,
  RawReply,
  RouteGeneric,
  ContextConfig,
  SchemaCompiler,
  TypeProvider,
  Logger
>;

export interface RouteBasic {
  field: Key;
  method: string;
  route: string[];
}

export interface RouteConfig {
  [Sym.RouteBasic]: RouteBasic;
  [Sym.RouteOpt]?: RouteOptType;
  [Sym.HandlerArgs]?: string[][];
  [Sym.RouteApiSchema]?: RouteApiSchema;
}
