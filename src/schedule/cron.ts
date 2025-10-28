import { expectMethodDecorator } from '@/asserts/decorator-context.js';
import { sym } from '@/common/sym.js';
import meta from '@/register/meta.js';
import { CronOptions } from '@/types/cron.js';
import { Func } from '@/types/primitive.js';

export function Cron(expression: string) {
  return function (target: Func, context: ClassMethodDecoratorContext) {
    expectMethodDecorator(target, context);
    meta.set<CronOptions>(context, [sym.cron, context.name], { expression });
  };
}

// todo 在lazy injector中使用，把cronjob都绑定好
export function bindCronJob() {}

// todo 所有模块初始化完成，项目启动了，可以开始运行cronjob了
export function startCronJobs() {}

export namespace CronExpression {
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
