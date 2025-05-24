// Shared types between frontend and backend

export interface Protocard {
  id: number;
  text_body: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProtocardRequest {
  text_body: string;
}

export interface UpdateProtocardRequest {
  text_body: string;
}

export interface ProtocardResponse {
  id: number;
  text_body: string;
  message: string;
}

export interface ProtocardCountResponse {
  count: number;
}

// Server-Sent Events types
export interface SSEEvent {
  type: string;
  [key: string]: any;
}

export interface SSEConnectedEvent extends SSEEvent {
  type: 'connected';
  message: string;
}

export interface SSEHeartbeatEvent extends SSEEvent {
  type: 'heartbeat';
  timestamp: string;
}