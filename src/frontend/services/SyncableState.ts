import { PendingEntityId } from '@/shared/types/db';
import { MessageID, PendingMessageID } from '@/shared/types/responses';

/**
 * Transitions allowed:
 * - Nothing -> Synced (if we get a protocard from the server)
 * - Nothing -> Creating (if we create a protocard)
 * - Creating -> Synced (after server confirmed)
 * - Synced -> Updating
 * - Updating -> Synced
 * - Synced -> Deleting
 * - Deleting -> None
 * - Anything -> Error
 *
 * Distinguished using "status" field
 * T should be an API transport type, e.g. ProtocardTransport
 */
export type SyncableState<T extends { entityId: string | number }> =
  | SyncedState<T>
  | CreatingState<T>
  | UpdatingState<T>
  | DeletingState<T>
  | ErrorState<T>;

export interface SyncedState<T extends { entityId: string | number }> {
  entityId: T['entityId'];
  status: 'synced';
  lastSynced: MessageID;
  curr: T;
}

export interface CreatingState<T extends { entityId: string | number }> {
  entityId: PendingEntityId;
  status: 'creating';
  syncingWith: PendingMessageID;
  curr: Omit<T, 'entityId'>;
}

export interface UpdatingState<T extends { entityId: string | number }> {
  entityId: T['entityId'];
  status: 'updating';
  lastSynced: MessageID;
  syncingWith: PendingMessageID;
  curr: Omit<T, 'entityId'>;
  updates: unknown;
}

export interface DeletingState<T extends { entityId: string | number }> {
  entityId: T['entityId'];
  status: 'deleting';
  lastSynced: MessageID;
  syncingWith: PendingMessageID;
  curr: T;
}

export interface ErrorState<T extends { entityId: string | number }> {
  entityId: T['entityId'] | PendingEntityId;
  status: 'error';
  error: {
    message: string;
  };
  lastSynced?: MessageID;
  syncingWith?: PendingMessageID;
  curr: T | Omit<T, 'entityId'>;
  updates?: unknown;
}
