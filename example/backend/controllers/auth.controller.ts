import { Controller } from '../../../src/decorators/router/controller.js';
import { Get, Post } from '../../../src/decorators/router/http-methods.js';
import { Body } from '../../../src/decorators/middlewares/pipe.js';
import { UseGuards } from '../../../src/decorators/middlewares/guard.js';
import { UseInterceptors } from '../../../src/decorators/middlewares/interceptor.js';
import { UseFilters } from '../../../src/decorators/middlewares/filter.js';
import { Inject } from '../../../src/decorators/inject.js';
import type { FastifyRequest } from 'fastify';

import { UserService } from '../services/user.service.js';
import { JwtGuard } from '../../../src/auth/jwt.guard.js';
import { TransformInterceptor } from '../interceptors/transform.interceptor.js';
import { HttpExceptionFilter } from '../filters/http-exception.filter.js';
import { UnauthorizedException } from '../../../src/exceptions/index.js';
import { JwtService } from '../../../src/index.js';

@Controller('api/auth')
@UseInterceptors(TransformInterceptor)
@UseFilters(HttpExceptionFilter)
export class AuthController {
  @Inject(UserService)
  private userService!: UserService;

  @Post('login')
  @Body()
  login(body: any) {
    const { username, password } = body;

    // Simple authentication - in production, verify password hash
    const user = this.userService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // In a real app, verify password here
    // For this example, we just check if password is provided
    if (!password) {
      throw new UnauthorizedException('Password is required');
    }

    const token = jwt.sign({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Get('profile')
  @UseGuards(JwtGuard)
  getProfile(req: FastifyRequest) {
    const user = (req as any).user;
    return {
      message: 'Authenticated user profile',
      user,
    };
  }

  @Post('verify')
  @Body()
  verify(body: any) {
    const { token } = body;
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {
      const payload = JwtService.default.verify(token);
      return {
        valid: true,
        payload,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
