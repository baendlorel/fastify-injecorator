import { type AnyFunction } from '@nestify-js/shared';

export interface CronOptions {
  expression: string;

  /**
   * This will generate arguments for the cron job function.
   */
  argsGetter: AnyFunction;
}
