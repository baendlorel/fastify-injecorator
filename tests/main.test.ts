import { describe, afterEach, it, expect } from 'vitest';
import fastify from 'fastify';

import { Injectable } from '@core/decorators/injectable.js';
import { Inject } from '@core/decorators/inject.js';
import { Module } from '@core/decorators/module.js';
import { apply } from '@core/register/index.js';
import { metaGetModule, metaGetProvider } from '@core/register/meta.js';
import { injector } from '@core/register/lazy-injector.js';
describe('Decorators Functionality', () => {
  afterEach(() => {
    injector.clear();
  });

  it('Injectable should mark class as provider', () => {
    @Injectable()
    class Service {}
    const providerMeta = metaGetProvider(Service);
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

    const instance = injector.createInstance(Target);
    expect(instance.dep).toBeInstanceOf(Dep);
  });

  it('Module should set module metadata', () => {
    @Injectable()
    class Svc {}
    @Module({ providers: [Svc] })
    class Mod {}
    const modMeta = metaGetModule(Mod);
    expect(modMeta.providers).toContain(Svc);
  });

  it('createInstance should cache singleton', () => {
    @Injectable()
    class S {}
    const a = injector.createInstance(S);
    const b = injector.createInstance(S);
    expect(a).toBe(b);
  });
});
