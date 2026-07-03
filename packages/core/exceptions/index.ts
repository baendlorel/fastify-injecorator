import { BaseHttpException } from '@/types/injecorator.js';
import { HttpStatus } from '@/common/status.js';

/**
 * Base HTTP exception class
 */
export class HttpException extends Error implements BaseHttpException {
  constructor(
    public readonly message: string,
    public readonly statusCode: HttpStatus,
    public readonly error: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  getResponse() {
    return {
      statusCode: this.statusCode,
      error: this.error || this.name,
      message: this.message,
    };
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestException extends HttpException {
  constructor(message = 'Bad Request') {
    super(message, HttpStatus.BAD_REQUEST, 'Bad Request');
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED, 'Unauthorized');
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(message, HttpStatus.FORBIDDEN, 'Forbidden');
  }
}

/**
 * 404 Not Found
 */
export class NotFoundException extends HttpException {
  constructor(message = 'Not Found') {
    super(message, HttpStatus.NOT_FOUND, 'Not Found');
  }
}

/**
 * 405 Method Not Allowed
 */
export class MethodNotAllowedException extends HttpException {
  constructor(message = 'Method Not Allowed') {
    super(message, HttpStatus.METHOD_NOT_ALLOWED, 'Method Not Allowed');
  }
}

/**
 * 406 Not Acceptable
 */
export class NotAcceptableException extends HttpException {
  constructor(message = 'Not Acceptable') {
    super(message, HttpStatus.NOT_ACCEPTABLE, 'Not Acceptable');
  }
}

/**
 * 408 Request Timeout
 */
export class RequestTimeoutException extends HttpException {
  constructor(message = 'Request Timeout') {
    super(message, HttpStatus.REQUEST_TIMEOUT, 'Request Timeout');
  }
}

/**
 * 409 Conflict
 */
export class ConflictException extends HttpException {
  constructor(message = 'Conflict') {
    super(message, HttpStatus.CONFLICT, 'Conflict');
  }
}

/**
 * 410 Gone
 */
export class GoneException extends HttpException {
  constructor(message = 'Gone') {
    super(message, HttpStatus.GONE, 'Gone');
  }
}

/**
 * 412 Precondition Failed
 */
export class PreconditionFailedException extends HttpException {
  constructor(message = 'Precondition Failed') {
    super(message, HttpStatus.PRECONDITION_FAILED, 'Precondition Failed');
  }
}

/**
 * 413 Payload Too Large
 */
export class PayloadTooLargeException extends HttpException {
  constructor(message = 'Payload Too Large') {
    super(message, HttpStatus.REQUEST_TOO_LONG, 'Payload Too Large');
  }
}

/**
 * 415 Unsupported Media Type
 */
export class UnsupportedMediaTypeException extends HttpException {
  constructor(message = 'Unsupported Media Type') {
    super(message, HttpStatus.UNSUPPORTED_MEDIA_TYPE, 'Unsupported Media Type');
  }
}

/**
 * 422 Unprocessable Entity
 */
export class UnprocessableEntityException extends HttpException {
  constructor(message = 'Unprocessable Entity') {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, 'Unprocessable Entity');
  }
}

/**
 * 429 Too Many Requests
 */
export class TooManyRequestsException extends HttpException {
  constructor(message = 'Too Many Requests') {
    super(message, HttpStatus.TOO_MANY_REQUESTS, 'Too Many Requests');
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerErrorException extends HttpException {
  constructor(message = 'Internal Server Error') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }
}

/**
 * 501 Not Implemented
 */
export class NotImplementedException extends HttpException {
  constructor(message = 'Not Implemented') {
    super(message, HttpStatus.NOT_IMPLEMENTED, 'Not Implemented');
  }
}

/**
 * 502 Bad Gateway
 */
export class BadGatewayException extends HttpException {
  constructor(message = 'Bad Gateway') {
    super(message, HttpStatus.BAD_GATEWAY, 'Bad Gateway');
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableException extends HttpException {
  constructor(message = 'Service Unavailable') {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, 'Service Unavailable');
  }
}

/**
 * 504 Gateway Timeout
 */
export class GatewayTimeoutException extends HttpException {
  constructor(message = 'Gateway Timeout') {
    super(message, HttpStatus.GATEWAY_TIMEOUT, 'Gateway Timeout');
  }
}

/**
 * 505 HTTP Version Not Supported
 */
export class HttpVersionNotSupportedException extends HttpException {
  constructor(message = 'HTTP Version Not Supported') {
    super(message, HttpStatus.HTTP_VERSION_NOT_SUPPORTED, 'HTTP Version Not Supported');
  }
}
