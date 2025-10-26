import { InjectArg } from '@/types/injecorator.js';
import { expect, eisClassFieldDecoratorContext, wisFunction, wisKey } from '@/asserts/index.js';
import meta from '@/register/meta.js';

export function Inject(token: InjectArg) {
  return function (_: undefined, context: ClassFieldDecoratorContext) {
    eisClassFieldDecoratorContext(context);
    expect(wisKey(token) || wisFunction(token), `Inject token must be string|symbol|function, got '${String(token)}'`);

    meta.setInject(context, token);
  };
}
