import { Protocard } from "@/server/db/types";
import { GenericValidation } from "@/shared/validation/validation";
import { BrandedTypeValidation } from "@/shared/validation/validation";

export function validateRowCount(row: unknown): { count: number } {
  if (!row || typeof row !== 'object' || !('count' in row) || typeof row.count !== 'number') {
    throw new Error('Invalid row');
  }
  return { count: row.count };
}

export function validateProtocard(row: unknown): Protocard {
  const data = GenericValidation.validateObject(row, 'database row');
  const { id, text_body, created_at, updated_at } = data;

  return {
    id: BrandedTypeValidation.validateProtocardId(id, 'id'),
    text_body: GenericValidation.validateString(text_body, 'text_body'),
    created_at: BrandedTypeValidation.validateDateString(created_at, 'created_at'),
    updated_at: BrandedTypeValidation.validateDateString(updated_at, 'updated_at'),
  };
}