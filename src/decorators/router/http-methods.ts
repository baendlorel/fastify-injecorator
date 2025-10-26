import { Func } from '@/types/primitive.js';
import { eisMethodDecorator, eisString, eorString } from '@/asserts/index.js';
import meta from '@/register/meta.js';

function registerRoute(method: string) {
  return function (route?: string) {
    return function (target: Func, context: ClassMethodDecoratorContext) {
      eisMethodDecorator(target, context);
      eisString(method, 'Method must be a string');
      eorString(route, 'Given route must be string or undefined');
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
