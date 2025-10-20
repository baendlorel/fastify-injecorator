import { expect } from '@/asserts/index.js';
import meta from '@/register/meta.js';

function registerRoute(method: string) {
  return function (route?: string) {
    return function (target: Func, context: StrictClassMethodDecoratorContext) {
      expect.methodDecorator(target, context);
      expect.isString(method);
      expect.orString(route, 'Given route must be string or undefined');
      meta.setRoute(context, method, route);
    };
  };
}

export const Get = registerRoute('GET');
export const Post = registerRoute('POST');
export const Patch = registerRoute('PATCH');
export const Put = registerRoute('PUT');
export const Delete = registerRoute('DELETE');
export const HttpMethod = function (method: string) {
  registerRoute(method.toUpperCase());
};
