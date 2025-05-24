// HTTP error classes for clean error handling

export abstract class HttpError extends Error {
  abstract readonly statusCode: number;
  abstract readonly userMessage: string;

  constructor(
    message: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends HttpError {
  readonly statusCode = 400;
  readonly userMessage: string;

  constructor(message: string, details?: any) {
    super(message, details);
    this.userMessage = message;
  }
}

export class NotFoundError extends HttpError {
  readonly statusCode = 404;
  readonly userMessage: string;

  constructor(resource: string, details?: any) {
    const message = `${resource} not found`;
    super(message, details);
    this.userMessage = message;
  }
}

export class InternalServerError extends HttpError {
  readonly statusCode = 500;
  readonly userMessage = 'Internal server error';

  constructor(message: string, details?: any) {
    super(message, details);
  }
}

export class DatabaseError extends InternalServerError {
  constructor(operation: string, originalError?: Error) {
    super(`Database error during ${operation}`, originalError);
  }
}
