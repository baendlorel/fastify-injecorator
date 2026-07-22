import type { Constructable } from '@nestify/shared';
import { expectInjectable, expectOrString } from '@core/asserts/index.js';
import { metaSetController } from '@core/register/meta.js';

/**
 * Use to register a controller.
 * @param prefix route prefix, will be added before each route in this class
 */
export function Controller(prefix?: string) {
  return function (target: Constructable, context: ClassDecoratorContext) {
    expectInjectable(target, context);
    expectOrString(prefix, 'Controller prefix must be a string or undefined');
    metaSetController(context, prefix);
  };
}
