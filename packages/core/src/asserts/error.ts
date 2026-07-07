export class InjecoratorError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = '__NAME__';
  }
}

declare global {
  function _throw(message: string): never;
}
