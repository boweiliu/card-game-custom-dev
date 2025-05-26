// API request/response types

import { ProtocardId } from '@/shared/types/id-prefixes';
import { PrefixedProtocardId } from '@/shared/types/id-prefixes';
import { MessageID } from '@/shared/types/responses';

// Parameter types for routes
export interface ProtocardParams {
  entityId: ProtocardId;
}

export type ProtocardTransportType = 'transport.protocard' & { __brand: never };

export type ProtocardTransport = {
  entityId: PrefixedProtocardId;
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
import { GameSnapshotId, PhysCardId, CardPosition } from '@/shared/types/db';

export type PhysCardTransportType = 'transport.physcard' & { __brand: never };

export type PhysCardTransport = {
  id: PhysCardId;
  protocardId: ProtocardId;
  position: CardPosition;
  positionIndex: number;
  type: PhysCardTransportType;
};

export type GameSnapshotTransportType = 'transport.gamesnapshot' & { __brand: never };

export type GameSnapshotTransport = {
  id: GameSnapshotId;
  priorSnapshotId: GameSnapshotId | null;
  physCards: PhysCardTransport[];
  createdAt: string;
  type: GameSnapshotTransportType;
};

export interface CreateGameSnapshotRequest {
  priorSnapshotId?: GameSnapshotId;
  physCards: PhysCardTransport[];
}

export type CreateGameSnapshotResponse = GameSnapshotTransport;
