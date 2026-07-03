import { Func } from './primitive.js';

export interface CronOptions {
  expression: string;

  /**
   * This will generate arguments for the cron job function.
   */
  argsGetter: Func;
}
