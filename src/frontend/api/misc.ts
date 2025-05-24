// Misc API service

import { apiClient } from '@/frontend/api/client';
import { API_PATHS_FRONTEND } from '@/shared/routes';
import { PingResponse, CountResponse } from '@/shared/types/api';

export class MiscApi {
  /**
   * Ping the backend
   */
  async ping(delaySeconds?: number): Promise<void> {
    const params = delaySeconds ? { delay: delaySeconds } : undefined;
    await apiClient.get<PingResponse>(API_PATHS_FRONTEND.ping(), params);
  }

  /**
   * Get call count
   */
  async getCallCount(): Promise<number> {
    const response = await apiClient.post<CountResponse>(
      API_PATHS_FRONTEND.count(),
      {}
    );
    return response.total;
  }
}

// Default instance
export const miscApi = new MiscApi();
