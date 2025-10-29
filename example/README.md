# Fastify Injecorator Example

This is a comprehensive example demonstrating all features of the Fastify Injecorator framework.

## Features Demonstrated

### Core Decorators

- `@Controller` - Define route controllers
- `@Get`, `@Post`, `@Patch`, `@Delete` - HTTP method decorators
- `@Injectable` - Mark classes as injectable services
- `@Inject` - Inject dependencies
- `@Module` - Define application modules

### Guards

- `@Guard` - Create custom guards
- `@UseGuards` - Apply guards to routes
- `JwtGuard` - JWT authentication guard
- `RolesGuard` - Role-based access control

### Interceptors

- `@Interceptor` - Create custom interceptors
- `@UseInterceptors` - Apply interceptors
- `LoggingInterceptor` - Log all requests
- `TransformInterceptor` - Transform responses

### Pipes

- `@Pipe` - Create custom pipes
- `@UsePipes` - Apply pipes
- `@Body` - Extract request body
- `ValidationPipe` - Validate request data
- `ParseIntPipe` - Parse integers

### Filters

- `@Filter` - Create exception filters
- `@UseFilters` - Apply filters
- `HttpExceptionFilter` - Handle HTTP exceptions

### Custom Decorators

- `createCustomDecorator` - Create custom metadata decorators
- `@Roles` - Custom role decorator example

### Authentication

- `JwtService` - JWT token management
- `JwtGuard` - Protect routes with JWT

### File Upload

- `@File` - Single file upload
- `@Files` - Multiple files upload
- Multipart support via `@fastify/multipart`

### Scheduled Tasks

- `@Cron` - Define cron jobs
- Automatic background task execution

### Exception Handling

- `HttpException` - Base HTTP exception
- `BadRequestException` - 400 errors
- `UnauthorizedException` - 401 errors
- Custom exception filters

## Project Structure

```
example/
├── backend/
│   ├── app.ts                    # Main application entry
│   ├── app.module.ts             # Root module
│   ├── controllers/              # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── upload.controller.ts
│   │   └── logs.controller.ts
│   ├── services/                 # Business logic services
│   │   ├── user.service.ts
│   │   └── logger.service.ts
│   ├── guards/                   # Custom guards
│   │   └── roles.guard.ts
│   ├── interceptors/             # Custom interceptors
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── pipes/                    # Custom pipes
│   │   ├── validation.pipe.ts
│   │   └── parse-int.pipe.ts
│   ├── filters/                  # Exception filters
│   │   └── http-exception.filter.ts
│   ├── decorators/               # Custom decorators
│   │   └── roles.decorator.ts
│   └── cron/                     # Scheduled tasks
│       └── scheduled-tasks.ts
├── frontend/                     # Frontend UI
│   ├── index.html
│   ├── main.js
│   └── style.css
├── files/                        # Uploaded files (gitignored)
└── package.json

```

## Running the Example

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Setup

1. Install dependencies from the root of the project:

```bash
cd /path/to/fastify-injecorator
pnpm install
```

2. Navigate to the example directory:

```bash
cd example
pnpm install
```

### Development

Run with hot reload:

```bash
pnpm dev
```

### Production

Build and run:

```bash
pnpm build
pnpm start
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`

2. The frontend provides a complete UI to test all features:
   - **Authentication**: Login with JWT tokens
   - **User Management**: CRUD operations with role-based guards
   - **File Upload**: Single and multiple file uploads
   - **Logging**: View interceptor logs
   - **Cron Jobs**: Background tasks run automatically

3. Default test users:
   - Username: `admin`, Role: `admin`
   - Username: `user`, Role: `user`
   - Username: `guest`, Role: `guest`
   - Password: `password` (any password works in this demo)

## API Endpoints

### Authentication

- `POST /api/auth/login/` - Login and get JWT token
- `GET /api/auth/profile/` - Get user profile (protected)
- `POST /api/auth/verify/` - Verify JWT token

### Users

- `GET /api/users/` - Get all users
- `GET /api/users/:id/` - Get user by ID
- `POST /api/users/` - Create user (admin only)
- `PATCH /api/users/:id/` - Update user (admin only)
- `DELETE /api/users/:id/` - Delete user (admin only)

### File Upload

- `POST /api/upload/single/` - Upload single file
- `POST /api/upload/multiple/` - Upload multiple files

### Logging

- `GET /api/logs/` - Get all logs
- `GET /api/logs/clear/` - Clear logs

## Environment Variables

- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `JWT_SECRET` - JWT secret key (default: auto-generated)

## Notes

- Uploaded files are stored in `example/files/` (gitignored)
- Cron jobs run automatically in the background
- All API responses are wrapped by TransformInterceptor
- All requests are logged by LoggingInterceptor
- JWT tokens expire after 1 hour
