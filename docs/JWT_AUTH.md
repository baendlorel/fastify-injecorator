# JWT Authentication in Fastify-Injecorator

This example demonstrates how to use JWT authentication in fastify-injecorator.

## Installation

Since JWT Service is built-in, no additional dependencies are required.

## Basic Usage

### 1. Create JWT Service Instance

```typescript
import { JwtService } from 'fastify-injecorator';

const jwtService = new JwtService({
  secret: 'your-secret-key',
  signOptions: {
    expiresIn: '1h', // Optional default expiration
  },
});
```

### 2. Create Authentication Controller

```typescript
import { Controller, Post, Get, UseGuards, JwtService, JwtGuard } from 'fastify-injecorator';
import { FastifyRequest } from 'fastify';
import lazyInjector from 'fastify-injecorator/register/lazy-injector';

@Controller('auth')
class AuthController {
  @Post('login')
  async login(req: FastifyRequest) {
    const { username, password } = req.body as { username: string; password: string };

    // Validate user credentials (your logic here)
    if (username === 'admin' && password === 'password') {
      const jwtService = lazyInjector.get<JwtService>('JwtService');
      const token = await jwtService.sign({
        sub: username,
        userId: 1,
        role: 'admin',
      });

      return { access_token: token };
    }

    throw new Error('Invalid credentials');
  }

  @Get('profile')
  @UseGuards(JwtGuard)
  getProfile(req: FastifyRequest) {
    // request.user contains the decoded JWT payload
    const user = (req as any).user;
    return {
      username: user.sub,
      userId: user.userId,
      role: user.role,
    };
  }
}
```

### 3. Register in Module

```typescript
import { Module } from 'fastify-injecorator';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: 'JwtService',
      useValue: new JwtService({ secret: 'your-secret-key' }),
    },
    JwtGuard,
  ],
})
class AppModule {}
```

### 4. Apply to Fastify

```typescript
import fastify from 'fastify';
import { apply } from 'fastify-injecorator';

const app = fastify();

await apply(app, { rootModule: AppModule });

await app.listen({ port: 3000 });
```

## Usage

### Login

```bash
curl -X POST http://localhost:3000/auth/login/ \\
  -H "Content-Type: application/json" \\
  -d '{"username": "admin", "password": "password"}'
```

Response:

```json
{
  "access_token": "eyJhbGc..."
}
```

### Access Protected Route

```bash
curl http://localhost:3000/auth/profile/ \\
  -H "Authorization: Bearer eyJhbGc..."
```

Response:

```json
{
  "username": "admin",
  "userId": 1,
  "role": "admin"
}
```

## Advanced Configuration

### Custom Sign Options

```typescript
const token = await jwtService.sign(
  { userId: 123 },
  {
    expiresIn: '7d',
    audience: 'myapp',
    issuer: 'myapp-auth',
  }
);
```

### Custom Verify Options

```typescript
const payload = await jwtService.verify(token, {
  audience: 'myapp',
  issuer: 'myapp-auth',
});
```

### Decode Without Verification

```typescript
// Useful for reading token info without validating signature
const payload = jwtService.decode(token);
```

## Token Expiration Time Format

The `expiresIn` option supports:

- Numbers (seconds): `3600` = 1 hour
- Strings: `'60s'`, `'5m'`, `'2h'`, `'7d'`
  - `s` = seconds
  - `m` = minutes
  - `h` = hours
  - `d` = days

## Security Notes

1. **Keep your secret safe**: Store it in environment variables, never in code
2. **Use HTTPS**: Always use HTTPS in production to prevent token interception
3. **Set appropriate expiration**: Don't make tokens live too long
4. **Validate all claims**: Check audience, issuer, and other claims as needed

## Error Handling

The JwtGuard will throw errors in these cases:

- No token provided
- Invalid token signature
- Expired token
- Invalid token format

You can use `@UseFilters()` to handle these errors gracefully.
