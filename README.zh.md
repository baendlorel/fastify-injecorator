# Nestify

[English Version README.md](./README.md)

> ⚠️ **警告**: 这还不是正式发布的版本，API 可能会发生变化。

**Injecorator** 是 "inject" 和 "decorator" 的合并词 - 一个基于 Fastify 的依赖注入框架，使用现代 Stage 3 装饰器而不是 NestJS 使用的旧版装饰器。

这个项目的创建是因为 NestJS 使用的是旧版装饰器语法，但我们希望能够利用新的 Stage 3 装饰器规范来获得更好的类型安全性和现代 JavaScript 特性。

## 安装

```bash
pnpm add nestify-js
```

## API 文档

装饰器使用起来的感觉大部分和NestJS一样，但也略有区别。

> Note: 推荐将tsconfig.json里的`strictPropertyInitialization`设为`false`，否则依赖注入的属性会有红色波浪线，因其没有初始化

### HTTP 方法装饰器

这些装饰器用于在控制器方法上定义 HTTP 路由：

```typescript
import { Get, Post, Put, Patch, Delete, HttpMethod } from 'nestify-js';

@Controller('/api')
class UserController {
  @Get('/users')
  getUsers() {
    return { users: [] };
  }

  @Post('/users')
  createUser() {
    return { message: '用户已创建' };
  }

  @Put('/users/:id')
  updateUser() {
    return { message: '用户已更新' };
  }

  @Patch('/users/:id')
  patchUser() {
    return { message: '用户已修改' };
  }

  @Delete('/users/:id')
  deleteUser() {
    return { message: '用户已删除' };
  }

  @(HttpMethod('OPTIONS')('/users'))
  optionsUsers() {
    return { methods: ['GET', 'POST'] };
  }
}
```

### 路由配置

#### `@Controller(prefix?: string)`

将类标记为控制器并可选地设置路由前缀：

```typescript
@Controller('/api/v1')
class ApiController {
  @Get('/health')
  health() {
    return { status: 'ok' };
  }
}
// 这会创建路由：GET /api/v1/health
```

#### `@ApiSchema(schema)`

为路由设置 OpenAPI/Swagger 模式信息：

```typescript
@Controller('/users')
class UserController {
  @Get('/:id')
  @ApiSchema({
    summary: '根据ID获取用户',
    description: '通过唯一标识符检索用户',
    tags: ['users'],
  })
  getUser() {
    return { user: {} };
  }
}
```

#### `@Opt(options)`

设置额外的 Fastify 路由选项：

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

### 依赖注入

#### `@Injectable()`

将类标记为可以被注入的服务：

```typescript
@Injectable()
class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}
```

#### `@Inject(token)`

将依赖项注入到类属性中：

```typescript
@Injectable()
class UserController {
  @Inject(UserService)
  userService: UserService;

  @Inject('DATABASE_URL')
  databaseUrl: string;

  getUsers() {
    return this.userService.getUsers();
  }
}
```

#### `@Module(options)`

定义具有提供者、控制器、导入和导出的模块：

```typescript
@Module({
  imports: [DatabaseModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
class UserModule {}
```

### 中间件系统

#### 守卫 (Guards)

守卫控制对路由的访问：

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
    return { data: '敏感数据' };
  }
}
```

#### 拦截器 (Interceptors)

拦截器可以修改请求/响应流：

```typescript
@Interceptor()
class LoggingInterceptor implements InjecoratorInterceptor {
  intercept(context: ExecutionContext) {
    const start = Date.now();
    console.log('请求开始');

    return () => {
      console.log(`请求完成，耗时 ${Date.now() - start}ms`);
    };
  }
}

@Controller('/api')
@UseInterceptors(LoggingInterceptor)
class ApiController {
  @Get('/data')
  getData() {
    return { data: '示例数据' };
  }
}
```

#### 管道 (Pipes)

管道转换和验证输入数据：

```typescript
@Pipe()
class ValidationPipe implements InjecoratorPipe {
  transform(context: ExecutionContext, input: any[]) {
    // 转换和验证输入
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

#### 过滤器 (Filters)

过滤器处理异常：

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
    throw new HttpException('出错了', 400);
  }
}
```

## 完整使用示例

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

// 服务
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

// 守卫
@Guard()
class AuthGuard {
  canActivate(context) {
    // 简单的认证检查
    const request = context.switchToHttp().getRequest();
    return request.headers.authorization === 'Bearer valid-token';
  }
}

// 控制器
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

// 模块
@Module({
  providers: [UserService, AuthGuard],
  controllers: [UserController],
})
class AppModule {}

// 应用程序设置
const app = fastify({ logger: true });

await apply(app, {
  rootModule: AppModule,
});

await app.listen({ port: 3000 });
console.log('服务器运行在 http://localhost:3000');
```

## 特性

- ✅ 现代 Stage 3 装饰器
- ✅ 支持循环依赖的依赖注入
- ✅ HTTP 方法装饰器 (GET, POST, PUT, PATCH, DELETE)
- ✅ 路由参数、查询和主体验证
- ✅ 用于身份验证/授权的守卫
- ✅ 用于请求/响应转换的拦截器
- ✅ 用于数据转换和验证的管道
- ✅ 异常过滤器
- ✅ 具有导入/导出的模块系统
- ✅ OpenAPI/Swagger 模式支持
- ✅ 内置 HTTP 异常
- ✅ 中间件执行上下文

## 许可证

MIT
