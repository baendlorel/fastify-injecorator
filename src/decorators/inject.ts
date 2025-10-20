import { InjectArg } from '@/types/injecorator.js';
import { expect, whether } from '@/asserts/index.js';
import meta from '@/register/meta.js';

export function Inject(token: InjectArg) {
  return function (target: undefined, context: ClassFieldDecoratorContext) {
    expect.isUndefined(target);
    expect.isClassFieldDecoratorContext(context);
    expect(
      whether.isKey(token) || whether.isFunction(token),
      `Inject token should be a key(string | symbol) or a function, got '${String(token)}'`
    );

    meta.setInject(context, token);
  };
}
