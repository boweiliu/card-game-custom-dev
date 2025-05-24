// Database entity types
import { InternalValidationError } from "@/server/errors/http-errors";

export interface Protocard {
  id: ProtocardId;
  text_body: string;
  created_at: DateString;
  updated_at: DateString;
}

// distinguished type for datestring
export type DateString = string & { __date_string: true };

// helper fn to validate dates are correctly formatted
function validateDateString(date: unknown): DateString {
  if (!date || typeof date !== 'string') {
    throw new InternalValidationError('Invalid date');
  }
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  if (!regex.test(date)) {
    throw new InternalValidationError('Invalid date');
  }
  return date as DateString;
}

function validateProtocardId(id: unknown): ProtocardId {
  if (!id || typeof id !== 'number') {
    throw new InternalValidationError('Invalid id');
  }
  return id as ProtocardId;
}

// Use a distinguished type so we cant mistake it for a number
export type ProtocardId = number & { __protocard_id: true };

// Function to validate the protocard shape, drop unused fields, and convert to Protocard type
export function validateProtocard(rawData: unknown): Protocard {
  if (!rawData || typeof rawData !== 'object') {
    throw new InternalValidationError('Invalid data shape');
  }
  const data = rawData as Record<string, unknown>;
  const { id, text_body, created_at, updated_at } = data;
  if (!text_body || typeof text_body !== 'string') {
    throw new InternalValidationError('Invalid text_body');
  }

  return {
    id: validateProtocardId(id),
    text_body,
    created_at: validateDateString(created_at),
    updated_at: validateDateString(updated_at),
  };
}
