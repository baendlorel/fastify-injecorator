/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Abstraction over the original handler arguments, allowing retrieval
 * of arguments in a protocol-agnostic way (HTTP, WebSocket, RPC, etc.).
 */
export interface ArgumentsHost {
  /**
   * Returns an array of original handler arguments.
   */
  getArgs();

  /**
   * Returns the handler argument at the specified index.
   */
  getArgByIndex<T = any>(index: number): T;

  /**
   * Switches the context to HTTP and returns request/response/next.
   */
  switchToHttp(): HttpArgumentsHost;

  /**
   * Switches the context to RPC and returns data/context.
   */
  switchToRpc(): RpcArgumentsHost;

  /**
   * Switches the context to WebSocket and returns client/data.
   */
  switchToWs(): WsArgumentsHost;

  /**
   * Returns the current context type (e.g., 'http', 'ws', 'rpc').
   */
  getType(): ContextType;
}

export interface HttpArgumentsHost {
  /**
   * Returns the HTTP request object.
   */
  getRequest<T = FastifyRequest>(): T;

  /**
   * Returns the HTTP response object.
   */
  getReply<T = FastifyReply>(): T;
}

/**
 * ! Not implemented
 */
export interface RpcArgumentsHost {
  /**
   * Returns the RPC data payload.
   */
  getData<T = any>(): T;

  /**
   * Returns the RPC-specific context.
   */
  getContext<T = any>(): T;
}

/**
 * ! Not implemented
 */
export interface WsArgumentsHost {
  /**
   * Returns the WebSocket client object.
   */
  getClient<T = any>(): T;

  /**
   * Returns the WebSocket incoming data/message.
   */
  getData<T = any>(): T;
}

export type ArgsTypeHttp = [FastifyRequest, FastifyReply];
export type ArgsTypeWebSocket = [any /* client */, any /* data */];
export type ArgsTypeRpc = [any /* data */, any /* context */];
export type ArgsType = ArgsTypeHttp | ArgsTypeWebSocket | ArgsTypeRpc;

export interface ArgsTypeMap {
  http: ArgsTypeHttp;
  ws: ArgsTypeWebSocket;
  rpc: ArgsTypeRpc;
}

// type ContextType = 'http' | 'ws' | 'rpc' | (string & {});
export type ContextType = keyof ArgsTypeMap;
