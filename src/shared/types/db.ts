// Shared database-related types (branded types only)

// Re-export the prefixed ID types for consistency
export { 
  type ProtocardId, 
  type PendingEntityId,
  type MessageID,
  type PendingMessageID 
} from '@/shared/types/id-prefixes';

// Distinguished type for datestring
export type DateString = string & { __date_string: true };
