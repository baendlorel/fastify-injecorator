import { Inject, Injectable } from 'nestify-js';

export interface Logger {
  info(message: string | object, staffCode?: string): void;
  warn(message: string | object, staffCode?: string): void;
  error(message: string | object, staffCode?: string): void;
}

const write = (level: string, moduleName: string, timestamp: Date, message: string | object, staffCode?: string) => {};

export function InjectLogger(moduleName: string = 'Global') {
  return function (_: undefined, context: ClassFieldDecoratorContext) {
    @Injectable()
    class LoggerClass implements Logger {
      info(message: string | object, staffCode?: string): void {
        write('info', moduleName, new Date(), message, staffCode);
      }
      warn(message: string | object, staffCode?: string): void {
        write('warn', moduleName, new Date(), message, staffCode);
      }
      error(message: string | object, staffCode?: string): void {
        write('error', moduleName, new Date(), message, staffCode);
      }
    }

    const injectable = LoggerClass;
    Object.defineProperty(injectable, 'name', { value: `Logger_${moduleName}`, configurable: true });
    return Inject(injectable)(_, context);
  };
}

/// 写在下方

import { toModule } from 'nestify-js';

/** nestify-js 未导出这些类型，这里用结构化的最小声明代替 */
type AnyConstructor = abstract new (...args: any[]) => any;
interface DynamicModule {
  moduleClass: AnyConstructor;
  isGlobal?: boolean;
}

/**
 * 创建一个具名的 Logger 可注入类（类名即 token：`Logger_${moduleName}`）
 */
export function createLoggerClass(moduleName: string = 'Global'): AnyConstructor {
  @Injectable()
  class LoggerClass implements Logger {
    info(message: string | object, staffCode?: string): void {
      write('info', moduleName, new Date(), message, staffCode);
    }
    warn(message: string | object, staffCode?: string): void {
      write('warn', moduleName, new Date(), message, staffCode);
    }
    error(message: string | object, staffCode?: string): void {
      write('error', moduleName, new Date(), message, staffCode);
    }
  }

  Object.defineProperty(LoggerClass, 'name', { value: `Logger_${moduleName}`, configurable: true });
  return LoggerClass;
}

/**
 * 全局 Logger 模块
 *
 * 用法：
 * ```ts
 * @Module({ imports: [LoggerModule('Order')] }) // global 模块须放在 root module
 * class AppModule {}
 *
 * @Injectable()
 * class OrderService {
 *   @Inject('Logger_Order') // 类名即 token，无需持有类引用
 *   logger!: Logger;
 * }
 * ```
 *
 * 原理：`toModule` 把类包成 `{ providers: [cls], exports: [cls], isGlobal: true }` 的
 * DynamicModule；global 模块的 exports 会进入 `collection.globalProviders`，
 * 从而所有模块的 `accessibleProviderTokens` 都可见。
 */
export function LoggerModule(moduleName: string = 'Global'): DynamicModule {
  return toModule(createLoggerClass(moduleName), { isGlobal: true });
}
/// 写在下方
