import { Interceptor } from '../../../src/decorators/middlewares/interceptor.js';
import { Inject } from '../../../src/decorators/inject.js';
import { ExecutionContext } from '../../../src/common/execution-context.js';
import { InjecoratorInterceptor } from '../../../src/types/middleware.js';
import { LoggerService } from '../services/logger.service.js';

@Interceptor()
export class LoggingInterceptor implements InjecoratorInterceptor {
  @Inject(LoggerService)
  private logger!: LoggerService;

  intercept(context: ExecutionContext) {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const reply = http.getReply();

    const { method, url } = request;
    const startTime = Date.now();

    this.logger.log(`→ ${method} ${url}`);

    // Return a function to be called after the handler
    return () => {
      const duration = Date.now() - startTime;
      this.logger.log(`← ${method} ${url} ${reply.statusCode} [${duration}ms]`);
    };
  }
}
