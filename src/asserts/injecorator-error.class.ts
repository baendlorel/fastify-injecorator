export class InjecoratorError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = '__NAME__';
  }
}
