import fastify from 'fastify';
import { describe, it, expect } from 'vitest';

import { Injectable, Inject } from '@/index.js';
import lazyInjector from '@/core/injecorator/register/lazy-injector.js';
import { Module } from '@/core/injecorator/decorators/module.js';
import { apply } from '@/core/injecorator/register/index.js';
// import '@/common/promise.js';

describe('Injectorator Full', () => {
  it('Inject should inject dependency into class field', () => {
    @Injectable()
    class Dep {
      @Inject(() => Target)
      field_target: any;
    }
    @Injectable()
    class Target {
      @Inject(Dep)
      field_dep: any;
    }

    @Module({
      providers: [Dep, Target],
    })
    class AppModule {}

    apply(fastify(), {
      rootModule: AppModule,
    });

    const instance = lazyInjector.createInstance(Target);
    expect(instance.field_dep).toBeInstanceOf(Dep);
    expect(instance.field_dep.field_target).toBeInstanceOf(Target);
  });

  it('should throw if dependency is not provided', async () => {
    @Injectable()
    class NotProvidedDep {}

    @Injectable()
    class Consumer {
      @Inject(NotProvidedDep)
      dep: any;
    }

    @Module({
      providers: [Consumer], // NotProvidedDep is missing
    })
    class AppModule {}

    await expect(Promise.try(apply, fastify(), { rootModule: AppModule })).rejects.toThrow();
  });

  it('should throw if @Injectable is missing', async () => {
    class NotInjectable {}

    @Injectable()
    class Consumer {
      @Inject(NotInjectable)
      dep: any;
    }

    @Module({
      providers: [Consumer, NotInjectable],
    })
    class AppModule {}
    await expect(Promise.try(apply, fastify(), { rootModule: AppModule })).rejects.toThrow();
  });

  it('should throw on complex multi-level circular dependency', async () => {
    @Injectable()
    class A {
      @Inject(() => B)
      b: any;
    }
    @Injectable()
    class B {
      @Inject(() => C)
      c: any;
    }
    @Injectable()
    class C {
      @Inject(() => D)
      d: any;
    }
    @Injectable()
    class D {
      @Inject(() => A)
      a: any;
    }

    @Module({
      providers: [A, B, C, D],
    })
    class AppModule {}

    await expect(Promise.try(apply, fastify(), { rootModule: AppModule })).rejects.toThrow();
  });
});
