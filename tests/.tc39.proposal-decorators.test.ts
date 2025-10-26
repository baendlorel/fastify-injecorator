import { describe, it, expect } from 'vitest';

describe('tc39 proposal-decorators behavior', () => {
  it('Metadata should be collected to A[Symbol.metadata]', () => {
    function meta(a: any, b: any) {
      console.log('a', a, 'b', b);
      if (typeof a !== 'function') {
        return;
      }
      const s = a.toString();
      if (s.startsWith('class ') || s.startsWith('[class ')) {
        b.metadata.my3 = 'class';
      } else {
        b.metadata.my2 = 'method';
      }
    }

    @meta
    class A {
      @meta
      method1() {}

      @meta
      field1 = 1;
    }

    const sym = (Symbol as any).metadata ?? Symbol.for('Symbol.metadata');

    expect((A as any)[sym]).toEqual({ my2: 'method', my3: 'class' });
  });
});
