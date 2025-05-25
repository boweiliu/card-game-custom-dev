// Shared database-related types (branded types only)

// Distinguished type for datestring
export type DateString = string & { __date_string: true };

// Use a distinguished type so we cant mistake it for a number
export type ProtocardId = number & { __protocard_id: true };

// An ID that has not been submitted to backend/database yet
export type PendingEntityId = string & { __pending_entity_id: true };

// Game history related IDs
export type GameSnapshotId = number & { __game_snapshot_id: true };
export type GameActionId = number & { __game_action_id: true };
export type PhysCardId = string & { __phys_card_id: true };
