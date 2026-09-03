import type { AnyFunction } from '@core/types/primitives.js';

export interface CronOptions {
  expression: string;

  /**
   * This will generate arguments for the cron job function.
   */
  argsGetter: AnyFunction;
}
