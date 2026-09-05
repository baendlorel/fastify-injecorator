import { Interceptor } from '../../../packages/core/src/decorators/middlewares/interceptor.js';
import { ExecutionContext } from '../../../packages/core/src/common/execution-context.js';
import { NestifyInterceptor } from '../../../packages/core/src/types/middleware.js';

@Interceptor()
export class TransformInterceptor implements NestifyInterceptor {
  intercept(context: ExecutionContext) {
    const http = context.switchToHttp();
    const reply = http.getReply();

    // Store original send method
    const originalSend = reply.send.bind(reply);
    let responseSent = false;

    // Override send to transform response
    reply.send = function (payload: any) {
      if (!responseSent) {
        responseSent = true;
        const transformed = {
          success: true,
          timestamp: new Date().toISOString(),
          data: payload,
        };
        return originalSend(transformed);
      }
      return originalSend(payload);
    } as any;
  }
}
