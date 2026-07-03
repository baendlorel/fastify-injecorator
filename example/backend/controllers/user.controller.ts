import { Controller } from '../../../packages/core/decorators/router/controller.js';
import { Get, Post, Patch, Delete } from '../../../packages/core/decorators/router/http-methods.js';
import { Body, Params, Query } from '../../../packages/core/decorators/middlewares/pipe.js';
import { UseGuards } from '../../../packages/core/decorators/middlewares/guard.js';
import { UseInterceptors } from '../../../packages/core/decorators/middlewares/interceptor.js';
import { UseFilters } from '../../../packages/core/decorators/middlewares/filter.js';
import { Inject } from '../../../packages/core/decorators/inject.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { UserService } from '../services/user.service.js';
import { JwtGuard } from '../../../packages/core/auth/jwt.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import { TransformInterceptor } from '../interceptors/transform.interceptor.js';
import { HttpExceptionFilter } from '../filters/http-exception.filter.js';
import { ParseIntPipe } from '../pipes/parse-int.pipe.js';
import { BadRequestException } from '../../../packages/core/exceptions/index.js';

@Controller('api/users')
@UseInterceptors(TransformInterceptor)
@UseFilters(HttpExceptionFilter)
export class UserController {
  @Inject(UserService)
  private userService!: UserService;

  @Get()
  findAll(req: FastifyRequest) {
    const role = (req.query as any)?.role;
    const users = this.userService.findAll();
    if (role) {
      return users.filter((u) => u.role === role);
    }
    return users;
  }

  @Get(':id')
  findOne(req: FastifyRequest) {
    const id = parseInt((req.params as any).id, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    const user = this.userService.findById(id);
    if (!user) {
      throw new BadRequestException(`User with id ${id} not found`);
    }
    return user;
  }

  @Post()
  @Body()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(['admin'])
  create(body: any) {
    const { username, email, role } = body;
    if (!username || !email) {
      throw new BadRequestException('username and email are required');
    }
    return this.userService.create({ username, email, role: role || 'user' });
  }

  @Patch(':id')
  @Body()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(['admin'])
  update(body: any, reply: FastifyReply, req: FastifyRequest) {
    const id = parseInt((req.params as any).id, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    const user = this.userService.update(id, body);
    if (!user) {
      throw new BadRequestException(`User with id ${id} not found`);
    }
    return user;
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(['admin'])
  delete(req: FastifyRequest) {
    const id = parseInt((req.params as any).id, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    const success = this.userService.delete(id);
    if (!success) {
      throw new BadRequestException(`User with id ${id} not found`);
    }
    return { message: 'User deleted successfully' };
  }
}
