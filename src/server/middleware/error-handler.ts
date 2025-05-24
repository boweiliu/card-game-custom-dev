import { Request, Response, NextFunction } from 'express';
import { HttpError } from '@/server/errors/http-errors';
import { ErrorResponse } from '@/shared/types/responses';

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

  // Handle known HTTP errors
  if (error instanceof HttpError) {
    const response: ErrorResponse = {
      success: false,
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
    success: false,
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
