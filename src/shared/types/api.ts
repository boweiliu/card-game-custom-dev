// API request/response types

import { ProtocardId } from '@/shared/types/db';
import { MessageID } from '@/shared/types/responses';

// Parameter types for routes
export interface ProtocardParams {
  entityId: ProtocardId;
}

export type ProtocardTransportType = 'transport.protocard' & { __brand: never };

export type ProtocardTransport = {
  entityId: ProtocardId;
  text_body: string;
  type: ProtocardTransportType;
};

// Protocard route types
export interface GetAllProtocardsRequest {}
export type GetAllProtocardsResponse = Array<ProtocardTransport>;

export interface GetProtocardCountRequest {}
export type GetProtocardCountResponse = { count: number };

export interface CreateProtocardRequest {
  // an idempotency id, not the entity id, which is auto-generated
  id?: MessageID;
  text_body: string;
}
export type CreateProtocardResponse = ProtocardTransport;

export interface UpdateProtocardRequest {
  // an idempotency id, not the entity id, which is auto-generated
  id?: MessageID;
  text_body: string;
}
export type UpdateProtocardResponse = ProtocardTransport;

export interface DeleteProtocardRequest {
  id?: MessageID;
}
export type DeleteProtocardResponse = ProtocardTransport | null;

// Misc route types
export interface PingRequest {
  delay?: number;
}
export type PingResponse = {};

export interface CountRequest {}
export type CountResponse = {
  total: number;
};

// Game history route types
import { GameSnapshotId, GameActionId, PhysCardId } from '@/shared/types/db';

export interface CreateGameSnapshotRequest {
  physCards: Array<{
    id: PhysCardId;
    protocardId: ProtocardId;
    position: 'deck' | 'hand' | 'score' | 'discard';
    positionIndex: number;
  }>;
}

export interface CreateGameActionRequest {
  parentActionId?: GameActionId;
  snapshotId: GameSnapshotId;
  actionType: 'user' | 'triggered' | 'system';
  actionName: 'draw_card' | 'play_card' | 'shuffle_deck' | 'move_card' | 'create_card';
  actionData: object;
}

export type GameSnapshotResponse = {
  id: GameSnapshotId;
  physCards: Array<{
    id: PhysCardId;
    protocardId: ProtocardId;
    position: 'deck' | 'hand' | 'score' | 'discard';
    positionIndex: number;
  }>;
  createdAt: string;
};

export type GameActionResponse = {
  id: GameActionId;
  parentActionId: GameActionId | null;
  snapshotId: GameSnapshotId;
  actionType: 'user' | 'triggered' | 'system';
  actionName: 'draw_card' | 'play_card' | 'shuffle_deck' | 'move_card' | 'create_card';
  actionData: object;
  createdAt: string;
};
