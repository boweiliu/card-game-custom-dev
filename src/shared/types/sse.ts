// Server-Sent Events types using JSON-RPC 2.0 inspired format
import { SuccessResponse, ErrorResponse } from '@/shared/types/responses';
import { ProtocardTransport } from '@/shared/types/api';
import { ProtocardId } from '@/shared/types/id-prefixes';

export interface SSEConnectedData {
  message: string;
}

export interface SSEHeartbeatData {
  count: number;
}

export interface SSEProtocardCreatedData {
  protocard: ProtocardTransport;
}

export interface SSEProtocardUpdatedData {
  protocard: ProtocardTransport;
}

export interface SSEProtocardDeletedData {
  id: ProtocardId;
}

// SSE specific response types
export type SSEConnectedResponse = SuccessResponse<SSEConnectedData> & {
  type: 'sse.connected';
};
export type SSEHeartbeatResponse = SuccessResponse<SSEHeartbeatData> & {
  type: 'sse.heartbeat';
};
export type SSEProtocardCreatedResponse =
  SuccessResponse<SSEProtocardCreatedData> & {
    type: 'sse.protocard.created';
  };
export type SSEProtocardUpdatedResponse =
  SuccessResponse<SSEProtocardUpdatedData> & {
    type: 'sse.protocard.updated';
  };
export type SSEProtocardDeletedResponse =
  SuccessResponse<SSEProtocardDeletedData> & {
    type: 'sse.protocard.deleted';
  };
export type SSEErrorResponse = ErrorResponse & { type: 'sse.error' };

// Union type for all SSE responses
export type SSEResponse =
  | SSEConnectedResponse
  | SSEHeartbeatResponse
  | SSEProtocardCreatedResponse
  | SSEProtocardUpdatedResponse
  | SSEProtocardDeletedResponse
  | SSEErrorResponse;
