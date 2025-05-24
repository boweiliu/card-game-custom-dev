// JSON-RPC 2.0 inspired response types for consistent API and SSE responses

// Represents an idempotency key for a new message that may or may not have been sent out already
export type PendingMessageID = (string | number) & {
  __pending_message_id: true;
};

// Represents a message ID that has been sent out, or we have received
export type MessageID = PendingMessageID & {
  __message_id: true;
};

// Test: which is assignable to which?
// NewMessageID is assignable to MessageID
// MessageID is assignable to NewMessageID
// const test: PendingMessageID = 1 as PendingMessageID;
// const test2: MessageID = test; // ts-expect-error // is an error because if we only have a pending id, it's not for sure confirmed yet
//
// const test3: MessageID = 3 as MessageID;
// const test4: PendingMessageID = test3;

export interface SuccessResponse<T = unknown> {
  id?: MessageID;
  success: true;
  type: string;
  result: T;
  meta: {
    timestamp: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    [key: string]: unknown;
  };
}

export interface ErrorResponse {
  id?: MessageID;
  success: false;
  type: string;
  error: {
    message: string;
    code?: string;
    data?: unknown;
  };
  meta: {
    timestamp: string;
    [key: string]: unknown;
  };
}

// Union type for all possible API responses
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;
