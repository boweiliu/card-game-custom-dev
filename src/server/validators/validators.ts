// Request validators for route handlers

import { BadRequestError } from '@/server/errors/http-errors';
import { ProtocardId } from '@/shared/types/db';
import { MessageID } from '@/shared/types/responses';
import {
  CreateProtocardRequest,
  UpdateProtocardRequest,
  ProtocardParams,
} from '@/shared/types/api';

export function validateMessageId(id: unknown): MessageID {
  if (!id || typeof id !== 'string') {
    throw new BadRequestError('Invalid message ID');
  }
  return id as MessageID;
}

// Helper function to validate protocard body data
function validateProtocardBody(inData: unknown): CreateProtocardRequest | UpdateProtocardRequest {
  if (!inData || typeof inData !== 'object') {
    throw new BadRequestError('Request body is required');
  }

  const data = inData as Record<string, unknown>;
  const { text_body, id } = data;

  if (!text_body || typeof text_body !== 'string') {
    throw new BadRequestError('text_body is required and must be a string');
  }

  return { 
    text_body, 
    ...(id ? { id: id as MessageID } : {})
  };
}

// Helper function to validate protocard params (entityId)
function validateProtocardParams(params: unknown): ProtocardParams {
  if (!params || typeof params !== 'object') {
    throw new BadRequestError('Invalid params');
  }

  const paramsData = params as Record<string, unknown>;
  const entityIdStr = paramsData.entityId;
  
  if (!entityIdStr || typeof entityIdStr !== 'string') {
    throw new BadRequestError('entityId is required');
  }

  const entityId = parseInt(entityIdStr, 10);
  if (isNaN(entityId)) {
    throw new BadRequestError('entityId must be a valid number');
  }

  return {
    entityId: entityId as ProtocardId,
  };
}

// Empty validator for requests with no body
export async function noBodyValidator(
  inData: unknown,
  params: unknown,
  req: unknown
): Promise<[void, {}]> {
  return [undefined, {}];
}

// Validator for protocard requests without params
export async function protocardValidator(
  inData: unknown,
  params: unknown,
  req: unknown
): Promise<[CreateProtocardRequest, {}]> {
  const validatedData = validateProtocardBody(inData) as CreateProtocardRequest;
  return [validatedData, {}];
}

// Validator for protocard requests with entity ID params
export async function protocardWithParamsValidator(
  inData: unknown,
  params: unknown,
  req: unknown
): Promise<[UpdateProtocardRequest, ProtocardParams]> {
  const validatedData = validateProtocardBody(inData) as UpdateProtocardRequest;
  const validatedParams = validateProtocardParams(params);
  return [validatedData, validatedParams];
}

// Validator for delete requests (no body, just params)
export async function deleteProtocardValidator(
  inData: unknown,
  params: unknown,
  req: unknown
): Promise<[{}, ProtocardParams]> {
  const validatedParams = validateProtocardParams(params);
  return [{}, validatedParams];
}
