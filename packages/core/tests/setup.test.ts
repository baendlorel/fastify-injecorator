import { describe, it, expect } from 'vitest';

import { isBasicPipe, PipeBody, PipeParams, PipeQuery, PipeIp, PipeRaw } from '@nestify-js/core';

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
