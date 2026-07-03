import { Module } from '../../packages/core/decorators/module.js';

// Services
import { UserService } from './services/user.service.js';
import { LoggerService } from './services/logger.service.js';

// Controllers
import { UserController } from './controllers/user.controller.js';
import { AuthController } from './controllers/auth.controller.js';
import { UploadController } from './controllers/upload.controller.js';
import { LogsController } from './controllers/logs.controller.js';

// Guards
import { RolesGuard } from './guards/roles.guard.js';

// Interceptors
import { LoggingInterceptor } from './interceptors/logging.interceptor.js';
import { TransformInterceptor } from './interceptors/transform.interceptor.js';

// Pipes
import { ValidationPipe } from './pipes/validation.pipe.js';
import { ParseIntPipe } from './pipes/parse-int.pipe.js';
import { PipeFile } from '../../packages/core/src/multipart/pipes/file.pipe.js';

// Filters
import { HttpExceptionFilter } from './filters/http-exception.filter.js';

// Auth
import { JwtGuard } from '../../packages/core/src/auth/jwt.guard.js';

// Cron
import { ScheduledTasks } from './cron/scheduled-tasks.js';

@Module({
  controllers: [UserController, AuthController, UploadController, LogsController],
  providers: [
    // Services
    UserService,
    LoggerService,

    // Guards
    RolesGuard,

    // Interceptors
    LoggingInterceptor,
    TransformInterceptor,

    // Pipes
    ValidationPipe,
    ParseIntPipe,
    PipeFile,

    // Filters
    HttpExceptionFilter,

    // Cron tasks
    ScheduledTasks,
  ],
})
export class AppModule {}
