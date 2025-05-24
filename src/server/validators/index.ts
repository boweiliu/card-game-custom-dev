// Request validators for route handlers

import { BadRequestError } from '@/server/errors/http-errors';
import {
  CreateProtocardRequest,
  UpdateProtocardRequest,
} from '@/shared/types/api';

// Empty validator for requests with no body
export async function noBodyValidator(
  inData: unknown,
  req: unknown
): Promise<void> {
  return;
}

// Validator for protocard requests
export async function protocardValidator(
  inData: unknown,
  req: unknown
): Promise<CreateProtocardRequest | UpdateProtocardRequest> {
  if (!inData || typeof inData !== 'object') {
    throw new BadRequestError('Request body is required');
  }

  const { text_body } = inData as any;

  if (!text_body || typeof text_body !== 'string') {
    throw new BadRequestError('text_body is required and must be a string');
  }

  return { text_body };
}
