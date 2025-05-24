import { GenericValidation, BrandedTypeValidation } from "@/shared/validation/validation";
import { SuccessResponse, ErrorResponse } from "@/shared/types/responses";

export function validateSSEResponse(rawResponse: unknown): SuccessResponse<unknown> | ErrorResponse {
  const data = GenericValidation.validateObject(rawResponse);

  const type = GenericValidation.validateString(data.type, 'type');
  const success = GenericValidation.validateBoolean(data.success, 'success');

  if (success) {
    return {
      id: BrandedTypeValidation.validateOptionalMessageID(data.id, 'id'),
      success,
      type,
      result: data.result,
      meta: data.meta as unknown as SuccessResponse['meta'],
    };
  } else {
    return {
      id: BrandedTypeValidation.validateOptionalMessageID(data.id, 'id'),
      success,
      type,
      error: GenericValidation.validateObject(data.error) as unknown as ErrorResponse['error'],
      meta: data.meta as unknown as ErrorResponse['meta'],
    };
  }

}
  

  
