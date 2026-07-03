import { Controller } from '../../../packages/core/decorators/router/controller.js';
import { Get } from '../../../packages/core/decorators/router/http-methods.js';
import { UseInterceptors } from '../../../packages/core/decorators/middlewares/interceptor.js';
import { UseFilters } from '../../../packages/core/decorators/middlewares/filter.js';
import { Inject } from '../../../packages/core/decorators/inject.js';

import { LoggerService } from '../services/logger.service.js';
import { LoggingInterceptor } from '../interceptors/logging.interceptor.js';
import { TransformInterceptor } from '../interceptors/transform.interceptor.js';
import { HttpExceptionFilter } from '../filters/http-exception.filter.js';

@Controller('api/logs')
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@UseFilters(HttpExceptionFilter)
export class LogsController {
  @Inject(LoggerService)
  private loggerService!: LoggerService;

  @Get()
  getLogs() {
    return {
      logs: this.loggerService.getLogs(),
      count: this.loggerService.getLogs().length,
    };
  }

  @Get('clear')
  clearLogs() {
    this.loggerService.clearLogs();
    return {
      message: 'Logs cleared successfully',
    };
  }
}
