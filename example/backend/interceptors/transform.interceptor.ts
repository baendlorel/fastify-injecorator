import { Interceptor } from '../../../src/decorators/middlewares/interceptor.js';
import { ExecutionContext } from '../../../src/common/execution-context.js';
import { InjecoratorInterceptor } from '../../../src/types/middleware.js';

@Interceptor()
export class TransformInterceptor implements InjecoratorInterceptor {
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
