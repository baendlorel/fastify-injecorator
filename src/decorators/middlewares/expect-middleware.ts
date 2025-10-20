import { InjectToken } from '@/types/injecorator.js';
import { expect } from '@/asserts/index.js';

/**
 * @param tokens tokens from `@UseXXXs(...tokens)`
 * @param target the target class or method where the middleware is applied
 * @param context
 */
export function expectMiddleware(
  tokens: InjectToken[],
  target: Class | Func,
  context: ClassDecoratorContext | ClassMethodDecoratorContext
) {
  if (context.kind === 'class') {
    expect.isClass(target as Class);
    expect.isClassDecoratorContext(context);
  } else {
    expect.isFunction(target);
    expect.isClassMethodDecoratorContext(context);
  }
  tokens.forEach((t) => expect.isInjectArg(t));
}
