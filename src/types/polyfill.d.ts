interface SymbolConstructor {
  /**
   * Polyfill for Symbol.metadata
   * - this is meant to store metadata when decorater is applied
   * @see https://github.com/tc39/proposal-decorator-metadata
   */
  metadata: symbol;
}
