// Server-side database entity types
import { ProtocardId } from '@/shared/types/id-prefixes';
import {
  DateString,
  GameSnapshotId,
  PhysCardId,
  CardPosition,
} from '@/shared/types/db';

export interface Protocard {
  id: ProtocardId;
  text_body: string;
  created_at: DateString;
  updated_at: DateString;
}

export interface PhysCard {
  id: PhysCardId;
  protocard_id: ProtocardId;
  position: CardPosition;
  position_index: number; // order within position
}

export interface GameSnapshot {
  id: GameSnapshotId;
  prior_snapshot_id: GameSnapshotId | null; // reference to previous snapshot
  phys_cards: PhysCard[]; // JSON serialized array
  created_at: DateString;
}
