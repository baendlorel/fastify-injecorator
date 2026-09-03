import { describe, it, expect } from 'vitest';

import * as nestify from '../src/index.js';

describe('Nestify umbrella — re-exports', () => {
  describe('core re-exports', () => {
    it('should export router decorators', () => {
      expect(typeof nestify.Controller).toBe('function');
      expect(typeof nestify.Get).toBe('function');
      expect(typeof nestify.Post).toBe('function');
      expect(typeof nestify.Patch).toBe('function');
      expect(typeof nestify.Put).toBe('function');
      expect(typeof nestify.Delete).toBe('function');
      expect(typeof nestify.ApiSchema).toBe('function');
    });

    it('should export DI decorators', () => {
      expect(typeof nestify.Injectable).toBe('function');
      expect(typeof nestify.Inject).toBe('function');
      expect(typeof nestify.Module).toBe('function');
    });

    it('should export middleware decorators and base classes', () => {
      expect(typeof nestify.UseGuards).toBe('function');
      expect(typeof nestify.UseInterceptors).toBe('function');
      expect(typeof nestify.UsePipes).toBe('function');
      expect(typeof nestify.UseFilters).toBe('function');
      expect(typeof nestify.Pipe).toBe('function');
      expect(typeof nestify.Guard).toBe('function');
    });

    it('should export fastifyInjecorator (core apply)', () => {
      expect(typeof nestify.fastifyInjecorator).toBe('function');
    });
  });

  describe('core re-exports (pipes)', () => {
    it('should export pipe decorators', () => {
      expect(typeof nestify.Body).toBe('function');
      expect(typeof nestify.Params).toBe('function');
      expect(typeof nestify.Query).toBe('function');
      expect(typeof nestify.Raw).toBe('function');
      expect(typeof nestify.Ip).toBe('function');
    });

    it('should export preset pipe classes', () => {
      expect(typeof nestify.PipeBody).toBe('function');
      expect(typeof nestify.PipeParams).toBe('function');
      expect(typeof nestify.PipeQuery).toBe('function');
      expect(typeof nestify.PipeIp).toBe('function');
      expect(typeof nestify.PipeRaw).toBe('function');
    });

    it('should export setupBasicPipes', () => {
      expect(typeof nestify.setupBasicPipes).toBe('function');
    });
  });

  describe('swagger re-exports', () => {
    it('should export setupSwagger function', () => {
      expect(typeof nestify.setupSwagger).toBe('function');
    });
  });

  describe('shared re-exports', () => {
    it('should export HttpStatus', () => {
      // @ts-expect-error
      expect(nestify.HttpStatus).toBeDefined();
    });

    it('should export common keys', () => {
      expect(nestify.APP_LOGGER).toBeDefined();
      expect(nestify.APP_INTERCEPTOR).toBeDefined();
      expect(nestify.APP_FILTER).toBeDefined();
      expect(nestify.APP_GUARD).toBeDefined();
      expect(nestify.APP_PIPE).toBeDefined();
    });
  });

  describe('wrapper apply', () => {
    it('should export apply as a function', () => {
      expect(typeof nestify.apply).toBe('function');
    });

    it('apply should be different from core fastifyInjecorator', () => {
      expect(nestify.apply).not.toBe(nestify.fastifyInjecorator);
    });
  });
});
