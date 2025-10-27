# Fastify-Injecorator 功能缺失分析与开发路线图

> 基于当前框架代码分析，整理出需要补充的功能模块
>
> 分析时间：2025-10-27  
> 框架版本：v0.0.1  
> 当前状态：核心功能完备，缺少企业级应用支持功能

## 🎯 优先级说明

- **P0 (高优先级)**: 框架基础功能，影响开发体验和框架完整性
- **P1 (中优先级)**: 企业应用常用功能，提升框架实用性
- **P2 (低优先级)**: 高级功能，增强框架竞争力

---

## 🔥 P0 级功能 - 急需补充

### 1. Testing Module (测试模块)

**现状分析**:

- 代码中引用了 `src/testing/index.ts` 但文件不存在
- 缺少单元测试时的依赖注入容器支持
- 无法方便地 mock 依赖进行测试

**建议实现**:

```typescript
// src/testing/index.ts
export class TestingModule {
  static createTestingModule(metadata: {
    providers?: ProviderOptions[];
    controllers?: Class[];
    imports?: (Class | DynamicModule)[];
  }): TestingModuleBuilder;
}

// 使用示例
const moduleRef = await Test.createTestingModule({
  providers: [UserService, { provide: DatabaseService, useValue: mockDb }],
  controllers: [UserController],
}).compile();

const userService = moduleRef.get<UserService>(UserService);
```

**实现要点**:

- 创建独立的测试容器，不影响生产环境
- 支持 provider 的 mock 和替换
- 提供 `get()` 方法获取实例
- 支持 `overrideProvider()` 方法替换依赖
- 测试结束后自动清理资源

---

### 2. Configuration Management (配置管理)

**现状分析**:

- 没有统一的配置管理机制
- 环境变量处理分散，缺少类型安全
- 没有配置验证和默认值支持

**建议实现**:

```typescript
// src/config/index.ts
@Injectable()
export class ConfigService {
  get<T = any>(key: string): T;
  get<T = any>(key: string, defaultValue: T): T;
  getNumber(key: string, defaultValue?: number): number;
  getString(key: string, defaultValue?: string): string;
  getBoolean(key: string, defaultValue?: boolean): boolean;
}

// 配置验证装饰器
export function ConfigModule(options: {
  schema?: ZodSchema;
  envFilePath?: string | string[];
  isGlobal?: boolean;
}): DynamicModule;
```

**实现要点**:

- 支持 `.env` 文件加载
- 提供类型安全的配置访问
- 集成 Zod 进行配置验证
- 支持嵌套配置对象
- 提供配置热重载（开发环境）

---

### 3. Lifecycle Hooks (生命周期钩子)

**现状分析**:

- 缺少模块和应用的生命周期管理
- 无法在启动/关闭时执行初始化/清理逻辑
- 数据库连接、缓存等资源管理困难

**建议实现**:

```typescript
// src/interfaces/lifecycle.ts
export interface OnModuleInit {
  onModuleInit(): void | Promise<void>;
}

export interface OnModuleDestroy {
  onModuleDestroy(): void | Promise<void>;
}

export interface OnApplicationBootstrap {
  onApplicationBootstrap(): void | Promise<void>;
}

export interface OnApplicationShutdown {
  onApplicationShutdown(signal?: string): void | Promise<void>;
}
```

**实现要点**:

- 在模块注册时检查生命周期接口
- 按正确顺序调用生命周期方法
- 支持异步生命周期方法
- 提供优雅关闭机制
- 错误处理和超时控制

---

## 🚀 P1 级功能 - 重要补充

### 4. Authentication & Authorization (认证授权)

**现状分析**:

- 有 Guard 机制但没有内置认证支持
- 缺少 JWT、Session 等常用认证方式
- 没有基于角色的访问控制 (RBAC)

**建议实现**:

```typescript
// src/auth/index.ts
@Injectable()
export class AuthGuard implements InjecoratorGuard {
  canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}

export function Auth(...roles: string[]) {
  return function (target: any, context: any) {
    // 设置所需角色元数据
  };
}

export function Public() {
  return function (target: any, context: any) {
    // 标记为公开访问
  };
}
```

**实现要点**:

- 提供 JWT 认证守卫
- 支持多种认证策略
- 集成 Passport.js
- 提供角色装饰器
- 支持权限级联检查

---

### 5. File Upload (文件上传)

**现状分析**:

- 缺少文件上传处理功能
- 没有文件大小、类型验证
- 缺少文件存储抽象层

**建议实现**:

```typescript
// src/upload/index.ts
export function UploadedFile(options?: { limits?: { fileSize?: number }; fileFilter?: (file: any) => boolean }) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // 文件上传参数装饰器
  };
}

@Injectable()
export class FileService {
  saveFile(file: UploadedFile, options?: SaveOptions): Promise<string>;
  deleteFile(path: string): Promise<void>;
}
```

**实现要点**:

- 集成 `@fastify/multipart`
- 支持单文件和多文件上传
- 提供文件验证中间件
- 支持本地存储和云存储
- 文件处理管道（压缩、格式转换）

---

### 6. Health Check (健康检查)

**现状分析**:

- 缺少应用健康状态监控
- 没有依赖服务检查机制
- 无法快速判断应用是否正常运行

**建议实现**:

```typescript
// src/health/index.ts
@Injectable()
export class HealthCheckService {
  check(checks: HealthIndicator[]): Promise<HealthCheckResult>;
}

export function HealthCheck() {
  return function (target: Class, context: ClassDecoratorContext) {
    // 健康检查指示器装饰器
  };
}
```

**实现要点**:

- 内置数据库、Redis 等常用检查器
- 自定义健康指示器支持
- 提供 `/health` 标准端点
- 支持优雅降级检查
- 集成监控系统 (Prometheus)

---

### 7. Event System (事件系统)

**现状分析**:

- 缺少模块间通信机制
- 没有事件驱动架构支持
- 难以实现解耦的业务逻辑

**建议实现**:

```typescript
// src/events/index.ts
@Injectable()
export class EventEmitter {
  emit<T = any>(event: string, payload: T): void;
  on<T = any>(event: string, listener: (payload: T) => void): void;
  once<T = any>(event: string, listener: (payload: T) => void): void;
}

export function OnEvent(event: string) {
  return function (target: any, propertyKey: string) {
    // 事件监听器装饰器
  };
}
```

**实现要点**:

- 基于 Node.js EventEmitter
- 支持异步事件处理
- 提供事件监听器装饰器
- 事件中间件支持
- 错误处理和重试机制

---

## 🎨 P2 级功能 - 高级特性

### 8. Caching (缓存系统)

**建议实现**:

- Redis 缓存支持
- 内存缓存实现
- 缓存装饰器 `@Cache()`
- 缓存失效策略
- 分布式缓存支持

### 9. Task Scheduling (定时任务)

**建议实现**:

- Cron 表达式支持
- 定时任务装饰器 `@Cron()`
- 任务队列集成
- 分布式任务调度
- 任务监控和日志

### 10. Rate Limiting (请求限流)

**建议实现**:

- 基于 IP 的限流
- 基于用户的限流
- 限流装饰器 `@Throttle()`
- Redis 分布式限流
- 自定义限流策略

### 11. Database Integration (数据库集成)

**建议实现**:

- TypeORM 集成模块
- Prisma 集成模块
- 数据库迁移支持
- 连接池管理
- 事务装饰器

### 12. Microservices (微服务)

**建议实现**:

- TCP/Redis 传输层
- 消息模式支持
- 服务发现机制
- 负载均衡
- 分布式追踪

### 13. GraphQL Support (GraphQL 支持)

**建议实现**:

- GraphQL 模块
- Schema 自动生成
- Resolver 装饰器
- 订阅支持
- Apollo Server 集成

### 14. WebSocket Support (WebSocket 支持)

**建议实现**:

- WebSocket 网关
- 实时消息推送
- 房间管理
- 身份验证集成
- 集群支持

---

## 📋 实现建议与注意事项

### 架构原则

1. **保持简洁**: 每个模块职责单一，API 简洁明了
2. **类型安全**: 充分利用 TypeScript 类型系统
3. **向后兼容**: 新功能不破坏现有 API
4. **可选依赖**: 功能模块可独立安装和使用

### 开发顺序

1. 先实现 P0 级功能，确保框架基础完善
2. 根据社区反馈优先实现高需求的 P1 级功能
3. P2 级功能可以作为插件形式提供

### 测试策略

- 每个新功能都要有完整的单元测试
- 提供 e2e 测试覆盖核心场景
- 集成 CI/CD 确保代码质量

### 文档要求

- 每个功能模块提供详细文档
- 包含使用示例和最佳实践
- 提供迁移指南（如果有breaking changes）

---

## 🏆 预期收益

完成这些功能后，fastify-injecorator 将成为一个：

- ✅ 功能完整的企业级框架
- ✅ 开发体验优秀的现代框架
- ✅ 性能卓越的轻量级框架
- ✅ 生态丰富的可扩展框架

**目标**: 成为 Node.js 生态中 NestJS 的有力竞争者，特别是在性能和现代化装饰器支持方面具备优势。
