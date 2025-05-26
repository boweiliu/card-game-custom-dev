// Shared database-related types (branded types only)
import { PrefixedId, ID_PREFIXES } from '@/shared/types/id-prefixes';

// Distinguished type for datestring
export type DateString = string & { __date_string: true };

// Game history related IDs (using prefixed ID system)
export type GameSnapshotId = PrefixedId<typeof ID_PREFIXES.GAME_SNAPSHOT>;
export type PhysCardId = string & { __phys_card_id: true };

// Card position for game history
export type CardPosition = 'deck' | 'hand' | 'score';
