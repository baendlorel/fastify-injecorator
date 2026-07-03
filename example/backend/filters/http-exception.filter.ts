import { Filter } from '../../../packages/core/decorators/middlewares/filter.js';
import { ExecutionContext } from '../../../packages/core/src/common/execution-context.js';
import { InjecoratorFilter } from '../../../packages/core/src/types/middleware.js';
import { HttpException } from '../../../packages/core/src/exceptions/index.js';

@Filter(HttpException)
export class HttpExceptionFilter implements InjecoratorFilter {
  catch(context: ExecutionContext, exception: unknown) {
    const http = context.switchToHttp();
    const reply = http.getReply();
    const request = http.getRequest();

    console.error('🔥 HttpExceptionFilter caught error:', {
      url: request.url,
      exception,
      isHttpException: exception instanceof HttpException,
      message: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      const errorResponse = {
        success: false,
        statusCode: exception.statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: typeof response === 'string' ? response : (response as any).message || 'Internal server error',
      };

      reply.status(exception.statusCode).send(errorResponse);
    } else {
      // Handle non-HTTP exceptions
      const errorMessage = exception instanceof Error ? exception.message : 'Internal server error';

      reply.status(500).send({
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: errorMessage,
        error: exception instanceof Error ? exception.stack : String(exception),
      });
    }
  }
}
