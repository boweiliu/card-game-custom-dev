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