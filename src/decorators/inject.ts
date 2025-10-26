import { InjectArg } from '@/types/injecorator.js';
import { expect, expectClassFieldDecoratorContext, wisFunction, wisKey } from '@/asserts/index.js';
import meta from '@/register/meta.js';

export function Inject(token: InjectArg) {
  return function (_: undefined, context: ClassFieldDecoratorContext) {
    expectClassFieldDecoratorContext(context);
    expect(wisKey(token) || wisFunction(token), `Inject token must be string|symbol|function, got '${String(token)}'`);

    meta.setInject(context, token);
  };
}
