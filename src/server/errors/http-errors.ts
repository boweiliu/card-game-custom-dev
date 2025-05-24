// HTTP error classes for clean error handling

export abstract class HttpError extends Error {
  abstract readonly statusCode: number;
  abstract readonly userMessage: string;
  readonly cause?: unknown;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message); // @ts-ignore
    this.name = this.constructor.name;

    // Set the cause property for error chaining
    if (options?.cause) {
      (this as any).cause = options.cause;
    }
  }
}

export class BadRequestError extends HttpError {
  readonly statusCode = 400;
  readonly userMessage: string;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.userMessage = message;
  }
}

export class NotFoundError extends HttpError {
  readonly statusCode = 404;
  readonly userMessage: string;

  constructor(resource: string, options?: { cause?: unknown }) {
    const message = `${resource} not found`;
    super(message, options);
    this.userMessage = message;
  }
}

export class InternalServerError extends HttpError {
  readonly statusCode = 500;
  readonly userMessage = 'Internal server error';

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}

export class DatabaseError extends InternalServerError {
  constructor(operation: string, originalError?: Error) {
    super(`Database error during ${operation}`, { cause: originalError });
  }
}

export class ValidationError extends BadRequestError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}

export class InternalValidationError extends InternalServerError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}
