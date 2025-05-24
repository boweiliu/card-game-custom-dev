// Protocard API service

import { apiClient } from '@/frontend/api/client';
import {
  GetAllProtocardsResponse,
  GetProtocardCountResponse,
  CreateProtocardRequest,
  CreateProtocardResponse,
  UpdateProtocardRequest,
  UpdateProtocardResponse,
  DeleteProtocardResponse,
} from '@/shared/types/api';
import { ProtocardId } from '@/server/db/types';

export class ProtocardApi {
  
  /**
   * Get all protocards
   */
  async getAll(): Promise<GetAllProtocardsResponse> {
    return apiClient.get<GetAllProtocardsResponse>('/protocards');
  }

  /**
   * Get protocard count
   */
  async getCount(): Promise<number> {
    const response = await apiClient.get<GetProtocardCountResponse>('/protocards/count');
    return response.count;
  }

  /**
   * Create a new protocard
   */
  async create(
    request: CreateProtocardRequest, 
  ): Promise<CreateProtocardResponse> {
    return apiClient.post<CreateProtocardResponse>(
      '/protocards', 
      request
    );
  }

  /**
   * Update a protocard
   */
  async update(
    entityId: ProtocardId,
    request: UpdateProtocardRequest,
  ): Promise<UpdateProtocardResponse> {
    return apiClient.put<UpdateProtocardResponse>(
      `/protocards/${entityId}`,
      request
    );
  }

  /**
   * Delete a protocard
   */
  async delete(
    entityId: ProtocardId,
  ): Promise<DeleteProtocardResponse> {
    return apiClient.delete<DeleteProtocardResponse>(
      `/protocards/${entityId}`
    );
  }
}

// Default instance
export const protocardApi = new ProtocardApi();