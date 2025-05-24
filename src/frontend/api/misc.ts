// Misc API service

import { apiClient } from '@/frontend/api/client';
import {
  PingResponse,
  CountResponse,
} from '@/shared/types/api';

export class MiscApi {
  
  /**
   * Ping the backend
   */
  async ping(delaySeconds?: number, correlationId?: string): Promise<void> {
    const endpoint = delaySeconds ? `/ping?delay=${delaySeconds}` : '/ping';
    await apiClient.get<PingResponse>(endpoint, correlationId);
  }

  /**
   * Get call count
   */
  async getCallCount(correlationId?: string): Promise<number> {
    const response = await apiClient.post<CountResponse>('/count', {}, correlationId);
    return response.total;
  }
}

// Default instance
export const miscApi = new MiscApi();