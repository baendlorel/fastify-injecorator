import { describe, it, expect, afterEach } from 'vitest';
import fastify, { FastifyRequest } from 'fastify';
import { Module } from '@core/decorators/module.js';
import { Controller } from '@core/decorators/router/controller.js';
import { Get, Post } from '@core/decorators/router/http-methods.js';
import { UseGuards } from '@core/decorators/middlewares/guard.js';
import { apply } from '@core/register/index.js';
import { injector } from '@core/register/lazy-injector.js';
import { JwtService, JwtGuard } from '@core/auth/index.js';

describe('JWT Authentication', () => {
  afterEach(() => {
    injector.clear();
  });

  it('should sign and verify JWT token', async () => {
    const secret = 'test-secret-key';
    const jwtService = new JwtService({ secret });

    const payload = { userId: 123, username: 'testuser' };
    const token = await jwtService.sign(payload, { expiresIn: '1h' });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = await jwtService.verify(token);
    expect(decoded.userId).toBe(123);
    expect(decoded.username).toBe('testuser');
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
  });

  it('should decode JWT token without verification', async () => {
    const secret = 'test-secret-key';
    const jwtService = new JwtService({ secret });

    const payload = { userId: 456, role: 'admin' };
    const token = await jwtService.sign(payload);

    const decoded = jwtService.decode(token);
    expect(decoded).toBeDefined();
    expect(decoded?.userId).toBe(456);
    expect(decoded?.role).toBe('admin');
  });

  it('should protect routes with JwtGuard', async () => {
    const app = fastify();
    const secret = 'test-secret-key';
    const jwtServiceInstance = new JwtService({ secret });

    @Controller('auth')
    class AuthController {
      @Post('login')
      async login(req: FastifyRequest) {
        const body = req.body as { username: string };
        const jwtService = injector.get<JwtService>('JwtService');
        if (!jwtService) {
          throw new Error('JwtService not found');
        }
        const token = await jwtService.sign({
          username: body.username,
          userId: 1,
        });
        return { access_token: token };
      }

      @Get('profile')
      @UseGuards(JwtGuard)
      getProfile(req: FastifyRequest) {
        // In real usage, request.user contains decoded JWT payload
        const user = (req as any).user;
        return { message: 'This is protected', user };
      }
    }

    @Module({
      controllers: [AuthController],
      providers: [
        {
          provide: 'JwtService',
          useValue: jwtServiceInstance,
        },
      ],
    })
    class AppModule {}

    await apply(app, { rootModule: AppModule });

    // Test login endpoint
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login/',
      payload: { username: 'testuser' },
    });

    expect(loginResponse.statusCode).toBe(200);
    const loginData = JSON.parse(loginResponse.body);
    expect(loginData.access_token).toBeDefined();

    // Test protected endpoint without token - should fail
    const unauthorizedResponse = await app.inject({
      method: 'GET',
      url: '/auth/profile/',
    });

    expect([400, 401, 500]).toContain(unauthorizedResponse.statusCode); // Guard throws error

    // Test protected endpoint with valid token - should succeed
    const authorizedResponse = await app.inject({
      method: 'GET',
      url: '/auth/profile/',
      headers: {
        authorization: `Bearer ${loginData.access_token}`,
      },
    });

    expect(authorizedResponse.statusCode).toBe(200);
    const profileData = JSON.parse(authorizedResponse.body);
    expect(profileData.message).toBe('This is protected');
    expect(profileData.user).toBeDefined();
    expect(profileData.user.username).toBe('testuser');

    await app.close();
  });

  it('should reject expired tokens', async () => {
    const secret = 'test-secret-key';
    const jwtService = new JwtService({ secret });

    // Create token that expires in 1 second
    const payload = { userId: 789 };
    const token = await jwtService.sign(payload, { expiresIn: 1 });

    // Wait 2 seconds to ensure expiration
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await expect(async () => {
      await jwtService.verify(token);
    }).rejects.toThrow('Token expired');
  });

  it('should reject tokens with invalid signature', async () => {
    const jwtService1 = new JwtService({ secret: 'secret1' });
    const jwtService2 = new JwtService({ secret: 'secret2' });

    const token = await jwtService1.sign({ userId: 999 });

    await expect(async () => {
      await jwtService2.verify(token);
    }).rejects.toThrow('Invalid token signature');
  });
});
