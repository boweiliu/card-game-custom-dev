import { Database } from 'sqlite3';
import { QUERIES } from '@/server/db/sql/queries';
import { Protocard, ProtocardId, GameSnapshot, GameAction, GameSnapshotId, GameActionId, PhysCard, ActionType, ActionName } from '@/server/db/types';
import { DatabaseError, NotFoundError } from '@/server/errors/http-errors';
import {
  validateProtocard,
  validateRowCount,
} from '@/server/db/validators/input';
import { GenericValidation } from '@/shared/validation/validation';
import { pubSubService } from '@/server/services/pubsub';

export class DatabaseRepository {
  constructor(private db: Database) {}

  // Count calls operations
  async insertCountCall(): Promise<{ id: number; total: number }> {
    return new Promise((resolve, reject) => {
      const db = this.db;
      db.run(QUERIES.COUNT_CALLS.INSERT, function (err) {
        if (err) {
          reject(new DatabaseError('inserting count call', err));
          return;
        }

        const insertId = this.lastID;
        // Get total count
        db.get(QUERIES.COUNT_CALLS.GET_COUNT, (err, row: unknown) => {
          if (err) {
            reject(new DatabaseError('getting count total', err));
            return;
          }
          const result = validateRowCount(row);
          resolve({ id: insertId, total: result.count });
        });
      });
    });
  }

  // Protocard operations
  async getAllProtocards(): Promise<Protocard[]> {
    return new Promise((resolve, reject) => {
      this.db.all(QUERIES.PROTOCARDS.SELECT_ALL, (err, rows: unknown[]) => {
        if (err) {
          reject(new DatabaseError('fetching all protocards', err));
          return;
        }
        try {
          const validatedCards = rows.map((row) => validateProtocard(row));
          resolve(validatedCards);
        } catch (validationError) {
          reject(
            new DatabaseError('validating protocards', validationError as Error)
          );
        }
      });
    });
  }

  async getProtocardCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(QUERIES.PROTOCARDS.GET_COUNT, (err, row: unknown) => {
        if (err) {
          reject(new DatabaseError('counting protocards', err));
          return;
        }
        const result = validateRowCount(row);
        resolve(result.count);
      });
    });
  }

  async createProtocord(textBody: string): Promise<Protocard> {
    GenericValidation.validateString(textBody);
    return new Promise((resolve, reject) => {
      this.db.get(
        QUERIES.PROTOCARDS.INSERT,
        [textBody],
        (err, row: unknown) => {
          if (err) {
            reject(new DatabaseError('creating protocard', err));
            return;
          }
          try {
            const validatedCard = validateProtocard(row);
            pubSubService.publish('protocard.created', {
              protocard: validatedCard,
            });
            resolve(validatedCard);
          } catch (validationError) {
            reject(
              new DatabaseError(
                'validating created protocard',
                validationError as Error
              )
            );
          }
        }
      );
    });
  }

  async updateProtocord(id: ProtocardId, textBody: string): Promise<Protocard> {
    GenericValidation.validatePositiveInteger(id);
    GenericValidation.validateString(textBody);

    return new Promise((resolve, reject) => {
      this.db.get(
        QUERIES.PROTOCARDS.UPDATE,
        [textBody, id],
        (err, row: unknown) => {
          if (err) {
            reject(new DatabaseError('updating protocard', err));
            return;
          }
          if (!row) {
            reject(new NotFoundError('Protocard'));
            return;
          }
          try {
            const validatedCard = validateProtocard(row);
            pubSubService.publish('protocard.updated', {
              protocard: validatedCard,
            });
            resolve(validatedCard);
          } catch (validationError) {
            reject(
              new DatabaseError(
                'validating updated protocard',
                validationError as Error
              )
            );
          }
        }
      );
    });
  }

  async deleteProtocord(
    id: ProtocardId
  ): Promise<{ deleted: Protocard | null }> {
    GenericValidation.validatePositiveInteger(id);
    return new Promise((resolve, reject) => {
      this.db.get(QUERIES.PROTOCARDS.DELETE, [id], (err, row: unknown) => {
        if (err) {
          reject(new DatabaseError('deleting protocard', err));
          return;
        }
        if (!row) {
          // already deleted, noop
          resolve({ deleted: null });
          return;
        }
        const deletedCard = validateProtocard(row);
        pubSubService.publish('protocard.deleted', {
          id: deletedCard.id,
        });
        resolve({ deleted: deletedCard });
      });
    });
  }

  // Game history operations
  async createGameSnapshot(physCards: PhysCard[]): Promise<GameSnapshot> {
    return new Promise((resolve, reject) => {
      const serializedCards = JSON.stringify(physCards);
      
      this.db.run(
        QUERIES.GAME_SNAPSHOTS.INSERT,
        [serializedCards],
        function (err) {
          if (err) {
            reject(new DatabaseError('creating game snapshot', err));
            return;
          }

          const snapshotId = this.lastID as GameSnapshotId;
          resolve({
            id: snapshotId,
            phys_cards: physCards,
            created_at: new Date().toISOString() as any,
          });
        }
      );
    });
  }

  async createGameAction(
    parentActionId: GameActionId | null,
    snapshotId: GameSnapshotId,
    actionType: ActionType,
    actionName: ActionName,
    actionData: object
  ): Promise<GameAction> {
    return new Promise((resolve, reject) => {
      const serializedData = JSON.stringify(actionData);
      
      this.db.run(
        QUERIES.GAME_ACTIONS.INSERT,
        [parentActionId, snapshotId, actionType, actionName, serializedData],
        function (err) {
          if (err) {
            reject(new DatabaseError('creating game action', err));
            return;
          }

          const actionId = this.lastID as GameActionId;
          resolve({
            id: actionId,
            parent_action_id: parentActionId,
            snapshot_id: snapshotId,
            action_type: actionType,
            action_name: actionName,
            action_data: actionData,
            created_at: new Date().toISOString() as any,
          });
        }
      );
    });
  }

  async getGameSnapshot(id: GameSnapshotId): Promise<GameSnapshot | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        QUERIES.GAME_SNAPSHOTS.GET_BY_ID,
        [id],
        (err, row: any) => {
          if (err) {
            reject(new DatabaseError('getting game snapshot', err));
            return;
          }

          if (!row) {
            resolve(null);
            return;
          }

          resolve({
            id: row.id as GameSnapshotId,
            phys_cards: JSON.parse(row.phys_cards),
            created_at: row.created_at,
          });
        }
      );
    });
  }

  async getGameAction(id: GameActionId): Promise<GameAction | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        QUERIES.GAME_ACTIONS.GET_BY_ID,
        [id],
        (err, row: any) => {
          if (err) {
            reject(new DatabaseError('getting game action', err));
            return;
          }

          if (!row) {
            resolve(null);
            return;
          }

          resolve({
            id: row.id as GameActionId,
            parent_action_id: row.parent_action_id as GameActionId | null,
            snapshot_id: row.snapshot_id as GameSnapshotId,
            action_type: row.action_type as ActionType,
            action_name: row.action_name as ActionName,
            action_data: JSON.parse(row.action_data),
            created_at: row.created_at,
          });
        }
      );
    });
  }

  async getGameActionsBySnapshot(snapshotId: GameSnapshotId): Promise<GameAction[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        QUERIES.GAME_ACTIONS.GET_BY_SNAPSHOT,
        [snapshotId],
        (err, rows: any[]) => {
          if (err) {
            reject(new DatabaseError('getting game actions by snapshot', err));
            return;
          }

          const actions = rows.map(row => ({
            id: row.id as GameActionId,
            parent_action_id: row.parent_action_id as GameActionId | null,
            snapshot_id: row.snapshot_id as GameSnapshotId,
            action_type: row.action_type as ActionType,
            action_name: row.action_name as ActionName,
            action_data: JSON.parse(row.action_data),
            created_at: row.created_at,
          }));

          resolve(actions);
        }
      );
    });
  }
}
