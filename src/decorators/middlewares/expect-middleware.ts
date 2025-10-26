import { Class, Func } from '@/types/primitive.js';
import { InjectToken } from '@/types/injecorator.js';

import { eisInjectArg } from '@/asserts/application.js';
import { eisClassDecoratorContext, eisClassMethodDecoratorContext } from '@/asserts/decorator-context.js';
import { eisClass, eisFunction } from '@/asserts/expect.js';

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
    eisClass(target as Class, 'target of class decorator must be a class');
    eisClassDecoratorContext(context);
  } else {
    eisFunction(target, 'target of method decorator must be a function');
    eisClassMethodDecoratorContext(context);
  }
  tokens.forEach((t) => eisInjectArg(t));
}
