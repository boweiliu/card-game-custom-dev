import { protocardApi } from '@/frontend/api/protocards';
import { ProtocardId } from '@/shared/types/db';
import { ProtocardTransport } from '@/shared/types/api';
import { MessageID } from '@/shared/types/responses';
import { SyncableState } from '@/frontend/services/SyncableState';

// Frontend state representation of a protocard
export type ProtocardState = SyncableState<ProtocardTransport>;

// Minimal protocard state manager for basic functionality
class ProtocardStateManager {
  async loadInitialState(): Promise<void> {
    try {
      const protocards = await protocardApi.getAll();
      console.log('Loaded protocards:', protocards.length);
    } catch (error) {
      console.error('Failed to load protocards:', error);
      throw error;
    }
  }
}

export const protocardState = new ProtocardStateManager();
