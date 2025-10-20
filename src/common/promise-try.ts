export function promiseTry<T = unknown>(
  fn: (...args: any[]) => T | Promise<T>,
  thisArg?: any,
  ...args: any[]
): Promise<T> {
  try {
    const result = fn.apply(thisArg, args);

    // If result is thenable (has a then function), assume it's a promise and return it directly.
    if (result !== null && (typeof result === 'object' || typeof result === 'function')) {
      const then = (result as any).then;
      if (typeof then === 'function') {
        return result as Promise<T>;
      }
    }

    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(err);
  }
}
