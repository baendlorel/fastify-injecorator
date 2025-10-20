import { describe, afterEach, it, expect } from 'vitest';
import fastify from 'fastify';

import { Injectable } from '@/decorators/injectable.js';
import { Inject } from '@/decorators/inject.js';
import { Module } from '@/decorators/module.js';
import { apply } from '@/register/index.js';
import meta from '@/register/meta.js';
import lazyInjector from '@/register/lazy-injector.js';
describe('Decorators Functionality', () => {
  afterEach(() => {
    lazyInjector.clear();
  });

  it('Injectable should mark class as provider', () => {
    @Injectable()
    class Service {}
    const providerMeta = meta.getProvider(Service);
    expect(providerMeta).toEqual({ args: [] });
  });

  it('Inject should inject dependency into class field', () => {
    @Injectable()
    class Dep {
      @Inject(() => Target)
      target: any;
    }
    @Injectable()
    class Target {
      @Inject(Dep)
      dep: any;
    }

    @Module({
      providers: [Dep, Target],
    })
    class AppModule {}

    apply(fastify(), { rootModule: AppModule });

    const instance = lazyInjector.createInstance(Target);
    expect(instance.dep).toBeInstanceOf(Dep);
  });

  it('Module should set module metadata', () => {
    @Injectable()
    class Svc {}
    @Module({ providers: [Svc] })
    class Mod {}
    const modMeta = meta.getModule(Mod);
    expect(modMeta.providers).toContain(Svc);
  });

  it('createInstance should cache singleton', () => {
    @Injectable()
    class S {}
    const a = lazyInjector.createInstance(S);
    const b = lazyInjector.createInstance(S);
    expect(a).toBe(b);
  });
});
