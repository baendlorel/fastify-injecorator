import { InjectArg } from '@core/types/injecorator.js';
import { expect, expectClassFieldDecoratorContext, isFunction, isKey } from '@core/asserts/index.js';
import { metaSetInject } from '@core/register/meta.js';

export function Inject(token: InjectArg) {
  return function (_: undefined, context: ClassFieldDecoratorContext) {
    expectClassFieldDecoratorContext(context, '@Inject must be used on class fields');
    expect(isKey(token) || isFunction(token), `Inject token must be string|symbol|function, got '${String(token)}'`);

    metaSetInject(context, token);
  };
}
