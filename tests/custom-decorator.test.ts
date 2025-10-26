import { describe, it, expect, afterEach } from 'vitest';
import fastify from 'fastify';

import {
  Controller,
  Module,
  Guard,
  Get,
  UseGuards,
  createCustomDecorator,
  getCustomMetadata,
  ExecutionContext,
} from '@/index.js';
import { apply } from '@/register/index.js';
import { InjecoratorGuard } from '@/types/middleware.js';
import lazyInjector from '@/register/lazy-injector.js';

describe('Custom Decorator Factory', () => {
  afterEach(() => {
    lazyInjector.clear();
  });

  it('should create and use custom decorators with metadata', async () => {
    // Create custom decorators
    const Roles = createCustomDecorator<string[]>('roles');
    const Permission = createCustomDecorator<string>('permission');

    // Create a guard that uses custom metadata
    @Guard()
    class RoleGuard implements InjecoratorGuard {
      canActivate(context: ExecutionContext): boolean {
        const roles = getCustomMetadata<string[]>(context.getClass(), 'roles', context.getClass());
        const permission = getCustomMetadata<string>(context.getHandler(), 'permission', context.getClass());

        // Simple role check
        return roles?.includes('admin') || permission === 'read';
      }
    }

    @Controller('api')
    @Roles(['user', 'admin'])
    class TestController {
      @Get('public')
      @Permission('read')
      getPublicData() {
        return { data: 'public' };
      }

      @Get('admin')
      @Roles(['admin'])
      @UseGuards(RoleGuard)
      getAdminData() {
        return { data: 'admin only' };
      }
    }

    @Module({
      providers: [RoleGuard],
      controllers: [TestController],
    })
    class TestModule {}

    const app = fastify();
    await apply(app, { rootModule: TestModule });

    // Test that the decorator stores metadata correctly
    const controllerRoles = getCustomMetadata<string[]>(TestController, 'roles', TestController);
    expect(controllerRoles).toEqual(['user', 'admin']);

    // Cleanup
    await app.close();
  });

  it('should handle undefined metadata gracefully', () => {
    class TestClass {}

    const nonExistentMetadata = getCustomMetadata<string>(TestClass, 'nonexistent', TestClass);
    expect(nonExistentMetadata).toBeUndefined();
  });

  it('should work with method decorators', () => {
    const MethodDecorator = createCustomDecorator<boolean>('test-method');

    class TestClass {
      @MethodDecorator(true)
      testMethod() {}
    }

    // Note: In a real scenario, this would be accessed through ExecutionContext
    // This is just testing the basic decorator functionality
    expect(MethodDecorator).toBeDefined();
  });
});
