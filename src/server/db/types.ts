// Server-side database entity types
import { ProtocardId, DateString, GameSnapshotId, GameActionId, PhysCardId } from '@/shared/types/db';

export interface Protocard {
  id: ProtocardId;
  text_body: string;
  created_at: DateString;
  updated_at: DateString;
}

// Game history types
export type CardPosition = 'deck' | 'hand' | 'score' | 'discard';

export interface PhysCard {
  id: PhysCardId;
  protocard_id: ProtocardId;
  position: CardPosition;
  position_index: number; // order within position
}

export interface GameSnapshot {
  id: GameSnapshotId;
  phys_cards: PhysCard[]; // JSON serialized array
  created_at: DateString;
}

export type ActionType = 'user' | 'triggered' | 'system';
export type ActionName = 'draw_card' | 'play_card' | 'shuffle_deck' | 'move_card' | 'create_card';

export interface GameAction {
  id: GameActionId;
  parent_action_id: GameActionId | null; // for tree structure
  snapshot_id: GameSnapshotId; // snapshot this action was created from
  action_type: ActionType;
  action_name: ActionName;
  action_data: object; // JSON serialized action-specific data
  created_at: DateString;
}

// Re-export shared types for convenience
export { ProtocardId, DateString, GameSnapshotId, GameActionId, PhysCardId } from '@/shared/types/db';
