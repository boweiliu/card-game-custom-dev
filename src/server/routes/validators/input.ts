/**
 * Input validators that ensure that incoming API requests are valid (and to make typescript happy)
 */

import {
  CreateProtocardRequest,
  UpdateProtocardRequest,
  ProtocardParams,
} from '@/shared/types/api';
import { GenericValidation } from '@/shared/validation/validation';
import { BrandedTypeValidation } from '@/shared/validation/validation';

// Empty validator for requests with no body
export async function noBodyValidator(
  inData: unknown,
  params: unknown,
  req: unknown
): Promise<[void, {}]> {
  return [undefined, {}];
}

// Validator for protocard requests without params
export async function createProtocardValidator(
  inData: unknown,
  params: unknown,
  req: unknown
): Promise<[CreateProtocardRequest, {}]> {
  const validatedData = validateProtocardBody(inData) as CreateProtocardRequest;
  return [validatedData, {}];
}

// Validator for protocard requests with entity ID params
export async function updateProtocardValidator(
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

function validateProtocardBody(inData: unknown): CreateProtocardRequest | UpdateProtocardRequest {
  const data = GenericValidation.validateObject(inData, 'request body');
  const { text_body, id } = data;


  return {
    id: BrandedTypeValidation.validateOptionalMessageID(id, 'id'),
    text_body: GenericValidation.validateString(text_body, 'text_body'),
  };
}
  

function validateProtocardParams(params: unknown): ProtocardParams {
  const data = GenericValidation.validateObject(params, 'request params');
  const { entityId } = data;
  return {
    entityId: BrandedTypeValidation.validateProtocardId(entityId, 'entityId'),
  };
}