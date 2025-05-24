// Response wrapper types for consistent API responses

export interface Response<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    [key: string]: any;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    [key: string]: any;
  };
}

// Union type for all possible API responses
export type ApiResponse<T = any> = Response<T> | ErrorResponse;
