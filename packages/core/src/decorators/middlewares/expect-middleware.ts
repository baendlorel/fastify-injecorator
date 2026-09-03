import { type Constructor, type AnyFunction } from '@nestify-js/shared';
import type { InjectToken } from '@core/types/injecorator.js';

import { expectInjectArg } from '@core/asserts/application.js';
import { expectClassDecoratorContext, expectClassMethodDecoratorContext } from '@core/asserts/decorator-context.js';
import { expectClass, expectFunction } from '@core/asserts/expect.js';

/**
 * @param tokens tokens from `@UseXXXs(...tokens)`
 * @param target the target class or method where the middleware is applied
 * @param context
 */
export function expectMiddleware(
  tokens: InjectToken[],
  target: Constructor | AnyFunction,
  context: ClassDecoratorContext | ClassMethodDecoratorContext,
) {
  if (context.kind === 'class') {
    expectClass(target as Constructor, 'target of class decorator must be a class');
    expectClassDecoratorContext(context, 'Invalid decorator context for class middleware decorator');
  } else {
    expectFunction(target, 'target of method decorator must be a function');
    expectClassMethodDecoratorContext(context, 'Invalid decorator context for method middleware decorator');
  }
  tokens.forEach((t) => expectInjectArg(t));
}
