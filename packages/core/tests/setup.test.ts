import { describe, it, expect, vi } from 'vitest';

import { isBasicPipe, setupBasicPipes, PipeBody, PipeParams, PipeQuery, PipeIp, PipeRaw } from '@nestify-js/core';

describe('isBasicPipe', () => {
  it('should return true for all five basic pipe classes', () => {
    expect(isBasicPipe(PipeBody)).toBe(true);
    expect(isBasicPipe(PipeParams)).toBe(true);
    expect(isBasicPipe(PipeQuery)).toBe(true);
    expect(isBasicPipe(PipeIp)).toBe(true);
    expect(isBasicPipe(PipeRaw)).toBe(true);
  });

  it('should return false for arbitrary values', () => {
    class CustomPipe {}
    expect(isBasicPipe(CustomPipe)).toBe(false);
    expect(isBasicPipe(null)).toBe(false);
    expect(isBasicPipe(undefined)).toBe(false);
    expect(isBasicPipe('PipeBody')).toBe(false);
    expect(isBasicPipe(42)).toBe(false);
  });
});

describe('setupBasicPipes', () => {
  it('should call register exactly 5 times', () => {
    const register = vi.fn();
    setupBasicPipes(register);
    expect(register).toHaveBeenCalledTimes(5);
  });

  it('should register pipes in the correct order: Body, Params, Ip, Query, Raw', () => {
    const register = vi.fn();
    setupBasicPipes(register);
    expect(register).toHaveBeenNthCalledWith(1, PipeBody);
    expect(register).toHaveBeenNthCalledWith(2, PipeParams);
    expect(register).toHaveBeenNthCalledWith(3, PipeIp);
    expect(register).toHaveBeenNthCalledWith(4, PipeQuery);
    expect(register).toHaveBeenNthCalledWith(5, PipeRaw);
  });

  it('should register all five pipe classes', () => {
    const registered: unknown[] = [];
    setupBasicPipes((cls) => registered.push(cls));
    expect(registered).toEqual([PipeBody, PipeParams, PipeIp, PipeQuery, PipeRaw]);
  });
});
