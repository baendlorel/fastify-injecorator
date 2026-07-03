import { Injectable } from '../../../packages/core/decorators/injectable.js';
import { Cron } from '../../../packages/core/src/schedule/cron.js';
import { Inject } from '../../../packages/core/decorators/inject.js';
import { LoggerService } from '../services/logger.service.js';

@Injectable()
export class ScheduledTasks {
  @Inject(LoggerService)
  private logger!: LoggerService;

  // Run every minute
  @Cron('*/1 * * * *')
  handleCron() {
    this.logger.log('Cron job executed: Running every minute');
  }

  // Run every 30 seconds
  @Cron({
    expression: '*/30 * * * * *',
    argsGetter: () => [],
  })
  handleFrequentCron() {
    this.logger.log('Cron job executed: Running every 30 seconds');
  }
}
