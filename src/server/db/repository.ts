import { Database } from 'sqlite3';
import { QUERIES } from '@/server/db/queries';
import { Protocard, ProtocardId, validateProtocard } from '@/shared/types/db';
import { DatabaseError, NotFoundError } from '@/server/errors/http-errors';

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
        db.get(QUERIES.COUNT_CALLS.GET_TOTAL, (err, row: unknown) => {
          if (err) {
            reject(new DatabaseError('getting count total', err));
            return;
          }
          if (!row || typeof row !== 'object' || !('total' in row) || typeof row.total !== 'number') {
            reject(new DatabaseError('getting count total', new Error('Invalid row')));
            return;
          }
          resolve({ id: insertId, total: row.total });
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
          const validatedCards = rows.map(row => validateProtocard(row));
          resolve(validatedCards);
        } catch (validationError) {
          reject(new DatabaseError('validating protocards', validationError as Error));
        }
      });
    });
  }

  async getProtocardCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(QUERIES.PROTOCARDS.SELECT_COUNT, (err, row: unknown) => {
        if (err) {
          reject(new DatabaseError('counting protocards', err));
          return;
        }
        if (!row || typeof row !== 'object' || !('count' in row) || typeof row.count !== 'number') {
          reject(new DatabaseError('counting protocards', new Error('Invalid row')));
          return;
        }
        resolve(row.count);
      });
    });
  }

  async createProtocord(textBody: string): Promise<Protocard> {
    return new Promise((resolve, reject) => {
      this.db.get(QUERIES.PROTOCARDS.INSERT, [textBody], (err, row: unknown) => {
        if (err) {
          reject(new DatabaseError('creating protocard', err));
          return;
        }
        try {
          const validatedCard = validateProtocard(row);
          resolve(validatedCard);
        } catch (validationError) {
          reject(new DatabaseError('validating created protocard', validationError as Error));
        }
      });
    });
  }

  async updateProtocord(id: ProtocardId, textBody: string): Promise<Protocard> {
    return new Promise((resolve, reject) => {
      this.db.get(QUERIES.PROTOCARDS.UPDATE, [textBody, id], (err, row: unknown) => {
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
          reject(new DatabaseError('validating updated protocard', validationError as Error));
        }
      });
    });
  }

  async deleteProtocord(id: ProtocardId): Promise<{ deleted: boolean }> {
    return new Promise((resolve, reject) => {
      this.db.run(QUERIES.PROTOCARDS.DELETE, [id], function (err) {
        if (err) {
          reject(new DatabaseError('deleting protocard', err));
          return;
        }
        if (this.changes === 0) {
          reject(new NotFoundError('Protocard'));
          return;
        }
        resolve({ deleted: true });
      });
    });
  }
}
