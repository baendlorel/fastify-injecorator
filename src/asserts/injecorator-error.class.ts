import { Sym } from '@/common/index.js';

export class InjecoratorError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = Sym.Name;
  }
}
