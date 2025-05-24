// Route-specific request and response types

import { Protocard } from '@/shared/types/db';

// Base route response wrapper
export interface RouteResponse<T = any> {
  data: T;
  statusCode?: number; // Optional, defaults to 200
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    [key: string]: any;
  };
}

// Parameter types for routes
export interface ProtocardParams {
  id: string;
}

// Protocard route types
export interface GetAllProtocardsRequest {}
export type GetAllProtocardsResponse = Array<Protocard>;

export interface GetProtocardCountRequest {}
export type GetProtocardCountResponse = { count: number };

export interface CreateProtocardRequest {
  text_body: string;
}
export type CreateProtocardResponse = {
  id: number;
  text_body: string;
  message: string;
}

export interface UpdateProtocardRequest {
  text_body: string;
}
export type UpdateProtocardResponse = {
  id: number;
  text_body: string;
  message: string;
}

export interface DeleteProtocardRequest {}
export type DeleteProtocardResponse = {
  message: string;
}

// Misc route types
export interface PingRequest {
  delay?: number;
}
export type PingResponse = {};

export interface CountRequest {}
export type CountResponse = {
  message: string;
  total: number;
  id: number;
}
