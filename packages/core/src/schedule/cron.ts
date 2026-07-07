import { CronExpressionParser } from 'cron-parser';
import { Class, Func } from '@core/types/primitive.js';
import { CronOptions } from '@core/types/cron.js';

import { expectMethodDecorator } from '@core/asserts/decorator-context.js';
import { metaGet, metaSet } from '@core/register/meta.js';
import { isObject, orFunction } from '@core/asserts/whether.js';
import { _entries, sym } from '@nestify/shared';

const defaultArgsGetter = () => [];

export function Cron(options: CronOptions): Func;
export function Cron(expression: string): Func;
export function Cron(arg: CronOptions | string): Func {
  if (isObject(arg) && typeof arg.expression === 'string' && orFunction(arg.argsGetter)) {
    // keep
    arg.argsGetter ??= defaultArgsGetter;
  } else if (typeof arg === 'string') {
    arg = { expression: arg, argsGetter: defaultArgsGetter };
  } else {
    _throw(`Invalid argument for @Cron(): ${typeof arg}`);
  }

  return function (target: Func, context: ClassMethodDecoratorContext) {
    expectMethodDecorator(target, context);
    metaSet<CronOptions>(context, [sym.cron, context.name], arg);
  };
}

const cronJobs: Func[] = [];

/**
 * Bind cron jobs for a given instance
 * This function is called in lazy injector after all instances are created
 */
export function bindCronJob(instance: InstanceType<Class>, sourceClass: Class) {
  const cronMeta = metaGet<Record<string, CronOptions>>(sourceClass, [sym.cron]);
  if (!cronMeta) {
    return;
  }

  const entries = _entries(cronMeta);
  for (let i = 0; i < entries.length; i++) {
    const methodName = entries[i][0];
    const { argsGetter, expression } = entries[i][1];
    const job = () => {
      const args = argsGetter();
      const next = CronExpressionParser.parse(expression).next();
      const delta = next.getTime() - Date.now();
      setTimeout(() => {
        instance[methodName](...args);
        job(); // to the next call
      }, delta);
    };
    cronJobs.push(job);
  }
}

/**
 * Start all registered cron jobs
 * This function is called after all modules are initialized and the application is ready
 */
export function startCronJobs() {
  for (let i = 0; i < cronJobs.length; i++) {
    cronJobs[i]();
  }
}

export namespace CronExpressions {
  export const EVERY_SECOND = '* * * * * *';
  export const EVERY_30_SECONDS = '*/30 * * * * *';
  export const EVERY_MINUTE = '* * * * *';
  export const EVERY_5_MINUTES = '*/5 * * * *';
  export const EVERY_10_MINUTES = '*/10 * * * *';
  export const EVERY_15_MINUTES = '*/15 * * * *';
  export const EVERY_30_MINUTES = '*/30 * * * *';
  export const HOURLY = '0 * * * *';
  export const DAILY = '0 0 * * *';
  export const WEEKLY = '0 0 * * 0';
  export const MONTHLY = '0 0 1 * *';
  export const YEARLY = '0 0 1 1 *';
}
