// Database entity types
import { GenericValidation } from '@/shared/validation/validation';

export interface Protocard {
  id: ProtocardId;
  text_body: string;
  created_at: DateString;
  updated_at: DateString;
}

// Distinguished type for datestring
export type DateString = string & { __date_string: true };

// Use a distinguished type so we cant mistake it for a number
export type ProtocardId = number & { __protocard_id: true };
