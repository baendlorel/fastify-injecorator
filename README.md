# Fastify Injecorator

[中文版本 README.zh.md](./README.zh.md)

> ⚠️ **Warning**: This is not an official release version. APIs may change in the future.

**Injecorator** is a portmanteau of "inject" and "decorator" - a dependency injection framework for Fastify that uses modern Stage 3 decorators instead of the legacy decorators used by NestJS.

This project was created because NestJS uses the old decorator syntax, but we wanted to leverage the new Stage 3 decorator specification for better type safety and modern JavaScript features.

## Installation

```bash
pnpm add fastify-injecorator
```

## API Documentation

Using of decorators looks basically like they are in NestJS, but with modern Stage 3 syntax.

> Note: It is recommended to set "strictPropertyInitialization": false in your tsconfig.json to avoid linting issues when using property injection.

### HTTP Method Decorators

These decorators are used to define HTTP routes on controller methods:

```typescript
import { Get, Post, Put, Patch, Delete, HttpMethod } from 'fastify-injecorator';

@Controller('/api')
class UserController {
  @Get('/users')
  getUsers() {
    return { users: [] };
  }

  @Post('/users')
  createUser() {
    return { message: 'User created' };
  }

  @Put('/users/:id')
  updateUser() {
    return { message: 'User updated' };
  }

  @Patch('/users/:id')
  patchUser() {
    return { message: 'User patched' };
  }

  @Delete('/users/:id')
  deleteUser() {
    return { message: 'User deleted' };
  }

  @(HttpMethod('OPTIONS')('/users'))
  optionsUsers() {
    return { methods: ['GET', 'POST'] };
  }
}
```

### Route Configuration

#### `@Controller(prefix?: string)`

Marks a class as a controller and optionally sets a route prefix:

```typescript
@Controller('/api/v1')
class ApiController {
  @Get('/health')
  health() {
    return { status: 'ok' };
  }
}
// This creates route: GET /api/v1/health
```

#### `@ApiSchema(schema)`

Sets OpenAPI/Swagger schema information for routes:

```typescript
@Controller('/users')
class UserController {
  @Get('/:id')
  @ApiSchema({
    summary: 'Get user by ID',
    description: 'Retrieves a user by their unique identifier',
    tags: ['users'],
  })
  getUser() {
    return { user: {} };
  }
}
```

#### `@Opt(options)`

Sets additional Fastify route options:

```typescript
@Controller('/files')
class FileController {
  @Post('/upload')
  @Opt({
    bodyLimit: 1048576, // 1MB
    attachValidation: true,
  })
  uploadFile() {
    return { uploaded: true };
  }
}
```

### Dependency Injection

#### `@Injectable()`

Marks a class as a service that can be injected:

```typescript
@Injectable()
class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}
```

#### `@Inject(token)`

Injects dependencies into class properties:

```typescript
@Injectable()
class UserController {
  @Inject(UserService)
  userService: UserService; // here might be linted by typescript, you can set "strictPropertyInitialization": false in tsconfig.json

  @Inject('DATABASE_URL')
  databaseUrl: string;

  getUsers() {
    return this.userService.getUsers();
  }
}
```

#### `@Module(options)`

Defines a module with providers, controllers, imports, and exports:

```typescript
@Module({
  imports: [DatabaseModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
class UserModule {}
```

### Middleware System

#### Guards

Guards control access to routes:

```typescript
@Guard()
class AuthGuard implements InjecoratorGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.headers.authorization != null;
  }
}

@Controller('/admin')
@UseGuards(AuthGuard)
class AdminController {
  @Get('/dashboard')
  getDashboard() {
    return { data: 'sensitive' };
  }
}
```

#### Interceptors

Interceptors can modify request/response flow:

```typescript
@Interceptor()
class LoggingInterceptor implements InjecoratorInterceptor {
  intercept(context: ExecutionContext) {
    const start = Date.now();
    console.log('Request started');

    return () => {
      console.log(`Request completed in ${Date.now() - start}ms`);
    };
  }
}

@Controller('/api')
@UseInterceptors(LoggingInterceptor)
class ApiController {
  @Get('/data')
  getData() {
    return { data: 'example' };
  }
}
```

#### Pipes

Pipes transform and validate input data:

```typescript
@Pipe()
class ValidationPipe implements InjecoratorPipe {
  transform(context: ExecutionContext, input: any[]) {
    // Transform and validate input
    return input;
  }
}

@Controller('/users')
class UserController {
  @Post('/')
  @Body({ type: 'object', required: ['name', 'email'] })
  createUser(@Body() body: any) {
    return { user: body };
  }

  @Get('/')
  @Query({ type: 'object' })
  getUsers(@Query() query: any) {
    return { users: [], query };
  }

  @Get('/:id')
  @Params({ type: 'object', required: ['id'] })
  getUser(@Params() params: any) {
    return { user: { id: params.id } };
  }

  @Get('/ip')
  getUserIP(@Ip() ip: string) {
    return { ip };
  }

  @Post('/raw')
  handleRaw(@Raw() raw: any) {
    return { received: true };
  }
}
```

#### Filters

Filters handle exceptions:

```typescript
@Filter(HttpException)
class HttpExceptionFilter implements InjecoratorFilter {
  catch(exception: HttpException, context: ExecutionContext) {
    const response = context.switchToHttp().getReply();
    response.status(exception.status).send({
      error: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}

@Controller('/api')
@UseFilters(HttpExceptionFilter)
class ApiController {
  @Get('/error')
  throwError() {
    throw new HttpException('Something went wrong', 400);
  }
}
```

## Complete Usage Example

```typescript
import fastify from 'fastify';
import {
  Module,
  Controller,
  Injectable,
  Inject,
  Get,
  Post,
  Body,
  Params,
  UseGuards,
  Guard,
  apply,
} from 'fastify-injecorator';

// Service
@Injectable()
class UserService {
  private users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];

  getUsers() {
    return this.users;
  }

  getUserById(id: number) {
    return this.users.find((user) => user.id === id);
  }

  createUser(userData: { name: string }) {
    const user = { id: Date.now(), ...userData };
    this.users.push(user);
    return user;
  }
}

// Guard
@Guard()
class AuthGuard {
  canActivate(context) {
    // Simple auth check
    const request = context.switchToHttp().getRequest();
    return request.headers.authorization === 'Bearer valid-token';
  }
}

// Controller
@Controller('/api/users')
class UserController {
  @Inject(UserService)
  userService: UserService;

  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }

  @Get('/:id')
  @Params({
    type: 'object',
    properties: { id: { type: 'number' } },
    required: ['id'],
  })
  getUser(@Params() params: { id: number }) {
    return this.userService.getUserById(params.id);
  }

  @Post('/')
  @UseGuards(AuthGuard)
  @Body({
    type: 'object',
    properties: { name: { type: 'string' } },
    required: ['name'],
  })
  createUser(@Body() body: { name: string }) {
    return this.userService.createUser(body);
  }
}

// Module
@Module({
  providers: [UserService, AuthGuard],
  controllers: [UserController],
})
class AppModule {}

// Application setup
const app = fastify({ logger: true });

await apply(app, {
  rootModule: AppModule,
});

await app.listen({ port: 3000 });
console.log('Server running on http://localhost:3000');
```

## Features

- ✅ Modern Stage 3 decorators
- ✅ Dependency injection with circular dependency support
- ✅ HTTP method decorators (GET, POST, PUT, PATCH, DELETE)
- ✅ Route parameters, query, and body validation
- ✅ Guards for authentication/authorization
- ✅ Interceptors for request/response transformation
- ✅ Pipes for data transformation and validation
- ✅ Exception filters
- ✅ Module system with imports/exports
- ✅ OpenAPI/Swagger schema support
- ✅ Built-in HTTP exceptions
- ✅ Execution context for middleware

## License

MIT
