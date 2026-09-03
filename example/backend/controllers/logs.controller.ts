import { Controller } from '../../../packages/core/src/decorators/router/controller.js';
import { Get } from '../../../packages/core/src/decorators/router/http-methods.js';
import { UseInterceptors } from '../../../packages/core/src/decorators/middlewares/interceptor.js';
import { UseFilters } from '../../../packages/core/src/decorators/middlewares/filter.js';
import { Inject } from '../../../packages/core/src/decorators/inject.js';

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
