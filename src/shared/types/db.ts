// Shared database-related types (branded types only)

// Distinguished type for datestring
export type DateString = string & { __date_string: true };

// Game history related IDs
export type GameSnapshotId = string & { __game_snapshot_id: true };
export type GameActionId = string & { __game_action_id: true };
export type PhysCardId = string & { __phys_card_id: true };

// Card position for game history
export type CardPosition = 'deck' | 'hand' | 'score';
