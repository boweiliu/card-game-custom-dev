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

// Game history related IDs - using prefixed system
export type GameSnapshotId = string & { __game_snapshot_id: true };
export type GameActionId = string & { __game_action_id: true };
export type PhysCardId = string & { __phys_card_id: true };

// Card position for game history
export type CardPosition = 'deck' | 'hand' | 'score';
