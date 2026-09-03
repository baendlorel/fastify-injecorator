export function _isObject<T extends object>(o: unknown): o is T {
  return typeof o === 'object' && o !== null;
}

export function _isKey(o: unknown): o is string | symbol {
  return typeof o === 'string' || typeof o === 'symbol';
}

/**
 * Only criterion: newable
 */
export function _isConstructable(o: any): o is new (...args: any) => any {
  if (typeof o !== 'function') {
    return false;
  }

  try {
    const temp = new Proxy(o, { construct: () => ({}) });
    new temp();
    return true;
  } catch {
    return false;
  }
}

export function _isFunction(o: any): o is (...args: any) => any {
  return typeof o === 'function';
}

export function _orFunction(o: any): o is ((...args: any) => any) | undefined {
  return typeof o === 'function' || o === undefined;
}

export function _isPathNode(p: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(p);
}
