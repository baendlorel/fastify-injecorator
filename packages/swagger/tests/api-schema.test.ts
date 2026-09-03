import { describe, it, expect } from 'vitest';

import { ApiSchema } from '@nestify-js/swagger';
import { sym } from '@nestify-js/shared';
import { metaGet } from '@core/src/register/meta.js';

/** Read the apiSchema metadata set by @ApiSchema */
function getApiSchema(cls: any, methodName: string) {
  return metaGet(cls, [sym.route.root, methodName, sym.route.apiSchema]);
}

describe('@ApiSchema decorator', () => {
  it('should return a decorator function', () => {
    const decorator = ApiSchema({ summary: 'Test' });
    expect(typeof decorator).toBe('function');
  });

  it('should set apiSchema metadata on the decorated method', () => {
    const schema = {
      summary: 'Get user by ID',
      description: 'Returns a single user',
      tags: ['users'],
    };

    class UserController {
      @ApiSchema(schema)
      getUser() {}
    }

    const stored = getApiSchema(UserController, 'getUser');
    expect(stored).toEqual(schema);
  });

  it('should set different schemas on different methods', () => {
    class Controller {
      @ApiSchema({ summary: 'List all' })
      list() {}

      @ApiSchema({ summary: 'Create one' })
      create() {}
    }

    expect(getApiSchema(Controller, 'list')).toEqual({ summary: 'List all' });
    expect(getApiSchema(Controller, 'create')).toEqual({ summary: 'Create one' });
  });

  it('should throw when used on a class instead of a method', () => {
    expect(() => {
      // @ts-expect-error
      @ApiSchema({ summary: 'bad' })
      class BadClass {}
    }).toThrow();
  });

  it('should throw when schema is not an object', () => {
    expect(() => {
      class Ctrl {
        @ApiSchema(null)
        handler() {}
      }
    }).toThrow();
  });
});
