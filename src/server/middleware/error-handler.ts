import { Request, Response, NextFunction } from 'express';
import { HttpError } from '@/server/errors/http-errors';
import { ErrorResponse, MessageID } from '@/shared/types/responses';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the full error for debugging
  console.error(`[Error Handler] ${error.name}: ${error.message}`);
  if (error.stack) {
    console.error(error.stack);
  }

  // Extract request ID if present
  const requestId: MessageID | undefined = (() => {
    const { body, query } = req;
    const hasBody = body && typeof body === 'object' && Object.keys(body).length > 0;
    const rawData = hasBody ? body : query;
    return (rawData && typeof rawData === 'object' && 'id' in rawData) 
      ? (rawData as any).id as MessageID
      : undefined;
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
          details: error.details,
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
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
      }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  res.status(500).json(response);
}
