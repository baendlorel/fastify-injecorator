export class NestifyError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NestifyError';
  }
}

declare global {
  function _throw(message: string): never;
}
