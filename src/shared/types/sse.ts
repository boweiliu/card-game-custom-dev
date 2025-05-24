// Server-Sent Events types using JSON-RPC 2.0 inspired format
import {
  SuccessResponse,
  ErrorResponse,
  MessageID,
} from '@/shared/types/responses';

export interface SSEEvent {
  type: string;
  [key: string]: unknown;
}

export interface SSEConnectedData {
  message: string;
}

export interface SSEHeartbeatData {
  count: number;
}

// SSE specific response types
export type SSEConnectedResponse = SuccessResponse<SSEConnectedData> & {
  type: 'sse.connected';
};
export type SSEHeartbeatResponse = SuccessResponse<SSEHeartbeatData> & {
  type: 'sse.heartbeat';
};
export type SSEErrorResponse = ErrorResponse & { type: 'sse.error' };

// Union type for all SSE responses
export type SSEResponse =
  | SSEConnectedResponse
  | SSEHeartbeatResponse
  | SSEErrorResponse;
