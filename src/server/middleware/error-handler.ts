import { Request, Response, NextFunction } from 'express';
import { HttpError } from '@/server/errors/http-errors';
import { ErrorResponse, MessageID } from '@/shared/types/responses';
import {
  extractRequestId,
  extractData,
} from '@/server/middleware/async-handler';

function logErrorChain(error: Error, depth = 0): void {
  const prefix = `[${depth}]`;
  console.error(`${prefix} [Error Handler] ${error.name}: ${error.message}`);

  if (error.stack) {
    console.error(`${prefix} Stack trace:`);
    console.error(error.stack);
  }

  const cause = (error as any).cause;
  if (cause && cause instanceof Error) {
    console.error(`${prefix} Caused by:`);
    logErrorChain(cause, depth + 1);
  } else if (cause) {
    console.error(`${prefix} Caused by non-Error:`, cause);
  }
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the full error chain for debugging
  logErrorChain(error);

  // Extract request ID if present
  const requestId: MessageID | undefined = (() => {
    try {
      const rawData = extractData(req);
      return extractRequestId(rawData);
    } catch (error) {
      console.error('Failed to extract request ID:', error);
      return undefined;
    }
  })();

  // Handle known HTTP errors
  if (error instanceof HttpError) {
    const response: ErrorResponse = {
      id: requestId,
      success: false,
      type: 'api.error',
      error: {
        message: error.userMessage,
        code: error.name,
        ...(process.env.NODE_ENV === 'development' && {
          cause: error.cause,
        }),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle unknown errors
  const response: ErrorResponse = {
    id: requestId,
    success: false,
    type: 'api.error',
    error: {
      message: error.message,
      code: error.name,
      ...(process.env.NODE_ENV === 'development' && {
        details: error.stack,
      }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  res.status(500).json(response);
}
