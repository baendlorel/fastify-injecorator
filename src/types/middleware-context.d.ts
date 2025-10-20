/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Abstraction over the original handler arguments, allowing retrieval
 * of arguments in a protocol-agnostic way (HTTP, WebSocket, RPC, etc.).
 */
interface ArgumentsHost {
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

interface HttpArgumentsHost {
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
interface RpcArgumentsHost {
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
interface WsArgumentsHost {
  /**
   * Returns the WebSocket client object.
   */
  getClient<T = any>(): T;

  /**
   * Returns the WebSocket incoming data/message.
   */
  getData<T = any>(): T;
}

type ArgsTypeHttp = [FastifyRequest, FastifyReply];
type ArgsTypeWebSocket = [any /* client */, any /* data */];
type ArgsTypeRpc = [any /* data */, any /* context */];
type ArgsType = ArgsTypeHttp | ArgsTypeWebSocket | ArgsTypeRpc;

interface ArgsTypeMap {
  http: ArgsTypeHttp;
  ws: ArgsTypeWebSocket;
  rpc: ArgsTypeRpc;
}

// type ContextType = 'http' | 'ws' | 'rpc' | (string & {});
type ContextType = keyof ArgsTypeMap;

// & Technically it is different from the ExecutionContext in the .ts file.
// & Since private props will stop TypeScript from assigning the instance to the type declared in .d.ts
// & So we have to remove the private props in the .d.ts file.
/**
 * ExecutionContext extends ArgumentsHost to provide reflection metadata
 * (who is the class and handler executing), enabling generic guards/interceptors.
 */
declare class ExecutionContext<CT extends keyof ArgsTypeMap = 'http'> implements ArgumentsHost {
  // private readonly args: ArgsTypeMap[CT];
  // private readonly controller: Class;
  // private readonly contextHandler: Func;
  // private readonly contextType: CT;

  constructor(args: ArgsTypeMap[CT], contextType: CT, controller: Class, handler: Func);

  getArgs(): ArgsTypeMap[CT];
  getArgByIndex<T = unknown>(index: number): T;
  switchToHttp(): HttpArgumentsHost;
  switchToRpc(): RpcArgumentsHost;
  switchToWs(): WsArgumentsHost;
  getType(): CT;
  getClass<T = unknown>(): Class<T>;
  getHandler(): Func;
}
