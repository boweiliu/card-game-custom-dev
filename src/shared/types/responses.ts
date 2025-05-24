// JSON-RPC 2.0 inspired response types for consistent API and SSE responses

export type MessageID = (string | number | null | undefined) & { __message_id: true };

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
