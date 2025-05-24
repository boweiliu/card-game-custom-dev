import { Database } from 'sqlite3';
import { QUERIES } from '@/server/db/sql/queries';
import { Protocard, ProtocardId } from '@/server/db/types';
import { DatabaseError, NotFoundError } from '@/server/errors/http-errors';
import {
  validateProtocard,
  validateRowCount,
} from '@/server/db/validators/input';
import { GenericValidation } from '@/shared/validation/validation';

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
        resolve({ deleted: validateProtocard(row) });
      });
    });
  }
}
