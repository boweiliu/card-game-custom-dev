// Frontend API client using fetch

import { ApiResponse } from '@/shared/types/responses';
import { MessageID } from '@/shared/types/responses';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: ApiResponse
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  correlationId?: string;
  timeout?: number;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultTimeout: number;

  constructor(baseUrl = '/api', defaultTimeout = 10000) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * Make an API request
   */
  async request<T>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      correlationId,
      timeout = this.defaultTimeout
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    
    // Build request config
    const requestConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(correlationId && { 'X-Correlation-ID': correlationId }),
      },
      signal: AbortSignal.timeout(timeout),
    };

    // Add body for non-GET requests
    if (method !== 'GET' && body !== undefined) {
      const bodyWithId = correlationId 
        ? { ...body, id: correlationId as MessageID }
        : body;
      requestConfig.body = JSON.stringify(bodyWithId);
    }

    try {
      const response = await fetch(url, requestConfig);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        );
      }

      // Check if the API returned an error response
      if (!data.success) {
        throw new ApiError(
          data.error.message,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError(`Request timeout after ${timeout}ms`, 408);
      }
      
      if (error instanceof TypeError) {
        throw new ApiError('Network error: Unable to connect to server', 0);
      }
      
      throw new ApiError(
        `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, correlationId?: string): Promise<T> {
    const response = await this.request<T>(endpoint, { 
      method: 'GET', 
      correlationId 
    });
    if (!response.success) {
      throw new ApiError('Response was not successful', 500, response);
    }
    return response.result;
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string, 
    body: unknown, 
    correlationId?: string
  ): Promise<T> {
    const response = await this.request<T>(endpoint, { 
      method: 'POST', 
      body, 
      correlationId 
    });
    if (!response.success) {
      throw new ApiError('Response was not successful', 500, response);
    }
    return response.result;
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string, 
    body: unknown, 
    correlationId?: string
  ): Promise<T> {
    const response = await this.request<T>(endpoint, { 
      method: 'PUT', 
      body, 
      correlationId 
    });
    if (!response.success) {
      throw new ApiError('Response was not successful', 500, response);
    }
    return response.result;
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, correlationId?: string): Promise<T> {
    const response = await this.request<T>(endpoint, { 
      method: 'DELETE', 
      correlationId 
    });
    if (!response.success) {
      throw new ApiError('Response was not successful', 500, response);
    }
    return response.result;
  }
}

// Default API client instance
export const apiClient = new ApiClient();