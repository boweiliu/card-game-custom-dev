// Protocard API service

import { apiClient } from '@/frontend/api/client';
import { API_PATHS_FRONTEND } from '@/shared/routes';
import {
  GetAllProtocardsResponse,
  GetProtocardCountResponse,
  CreateProtocardRequest,
  CreateProtocardResponse,
  UpdateProtocardRequest,
  UpdateProtocardResponse,
  DeleteProtocardResponse,
} from '@/shared/types/api';
import { ProtocardId } from '@/shared/types/id-prefixes';

export class ProtocardApi {
  /**
   * Get all protocards
   */
  async getAll(): Promise<GetAllProtocardsResponse> {
    return apiClient.get<GetAllProtocardsResponse>(
      API_PATHS_FRONTEND.protocards.getAll()
    );
  }

  /**
   * Get protocard count
   */
  async getCount(): Promise<number> {
    const response = await apiClient.get<GetProtocardCountResponse>(
      API_PATHS_FRONTEND.protocards.getCount()
    );
    return response.count;
  }

  /**
   * Create a new protocard
   */
  async create(
    request: CreateProtocardRequest
  ): Promise<CreateProtocardResponse> {
    return apiClient.post<CreateProtocardResponse>(
      API_PATHS_FRONTEND.protocards.create(),
      request
    );
  }

  /**
   * Update a protocard
   */
  async update(
    entityId: ProtocardId,
    request: UpdateProtocardRequest
  ): Promise<UpdateProtocardResponse> {
    return apiClient.put<UpdateProtocardResponse>(
      API_PATHS_FRONTEND.protocards.update(entityId),
      request
    );
  }

  /**
   * Delete a protocard
   */
  async delete(entityId: ProtocardId): Promise<DeleteProtocardResponse> {
    return apiClient.delete<DeleteProtocardResponse>(
      API_PATHS_FRONTEND.protocards.delete(entityId)
    );
  }
}

// Default instance
export const protocardApi = new ProtocardApi();
