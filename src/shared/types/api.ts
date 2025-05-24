// API request/response types

import { Protocard, ProtocardId } from '@/shared/types/db';
import { MessageID } from '@/shared/types/responses';


// Parameter types for routes
export interface ProtocardParams {
  entityId: ProtocardId;
}

// Protocard route types
export interface GetAllProtocardsRequest {}
export type GetAllProtocardsResponse = Array<Protocard>;

export interface GetProtocardCountRequest {}
export type GetProtocardCountResponse = { count: number };

export interface CreateProtocardRequest {
  // an idempotency id, not the entity id, which is auto-generated
  id?: MessageID;
  text_body: string;
}
export type CreateProtocardResponse = Protocard;

export interface UpdateProtocardRequest {
  // an idempotency id, not the entity id, which is auto-generated
  id?: MessageID;
  text_body: string;
}
export type UpdateProtocardResponse = Protocard;

export interface DeleteProtocardRequest {
  id?: MessageID;
}
export type DeleteProtocardResponse = {
  entityId: ProtocardId;
};

// Misc route types
export interface PingRequest {
  delay?: number;
}
export type PingResponse = {};

export interface CountRequest {
}
export type CountResponse = {
  total: number;
};
