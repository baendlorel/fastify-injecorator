import { DynamicModule } from '@/types/injecorator.js';
import { expect, whether } from '@/asserts/index.js';

/**
 * Check if the given path is valid and split it into segments.
 * - The path must start with a slash and can only contain alphanumeric characters, slashes,
 * @param p path, can be undefined
 */
export function splitPath(p: string | undefined): string[] {
  if (p === undefined || p === '' || p === '/') {
    return [];
  }

  if (p.endsWith('/')) {
    p = p.replace(/[/]+$/, ''); // Remove trailing slash if present
  }

  if (!/^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/.test(p)) {
    expect.throws(`Path must match /^[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*$/. But got: [${p}]`);
  }
  return p.split('/').filter((s) => s !== '');
}

// # parameter normalization
export function toDynamicModule(mod: Class | DynamicModule): DynamicModule {
  return whether.likeModule(mod)
    ? { moduleClass: mod, isGlobal: false }
    : { moduleClass: mod.moduleClass, isGlobal: mod.isGlobal ?? false };
}

export function toModuleClass(mod: Class | DynamicModule): Class {
  return whether.likeModule(mod) ? mod : mod.moduleClass;
}

export function createNamedClass(name: string): Class {
  return new Function(`return class ${name} {}`)();
}
