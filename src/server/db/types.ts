// Server-side database entity types
import { ProtocardId, DateString } from '@/shared/types/db';

export interface Protocard {
  id: ProtocardId;
  text_body: string;
  created_at: DateString;
  updated_at: DateString;
}

// Re-export shared types for convenience
export { ProtocardId, DateString } from '@/shared/types/db';
