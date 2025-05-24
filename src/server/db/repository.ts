import { Database } from 'sqlite3';
import { QUERIES } from '@/server/db/queries';
import { Protocard } from '@/shared/types/db';

export class DatabaseRepository {
  constructor(private db: Database) {}

  // Count calls operations
  async insertCountCall(): Promise<{ id: number; total: number }> {
    return new Promise((resolve, reject) => {
      const db = this.db;
      db.run(QUERIES.COUNT_CALLS.INSERT, function (err) {
        if (err) {
          reject(err);
          return;
        }

        const insertId = this.lastID;
        // Get total count
        db.get(QUERIES.COUNT_CALLS.GET_TOTAL, (err, row: any) => {
          if (err) {
            reject(err);
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
      this.db.all(QUERIES.PROTOCARDS.SELECT_ALL, (err, rows: Protocard[]) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  async getProtocardCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(QUERIES.PROTOCARDS.SELECT_COUNT, (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row.count);
      });
    });
  }

  async createProtocord(
    textBody: string
  ): Promise<{ id: number; text_body: string }> {
    return new Promise((resolve, reject) => {
      this.db.run(QUERIES.PROTOCARDS.INSERT, [textBody], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID, text_body: textBody });
      });
    });
  }

  async updateProtocord(
    id: number,
    textBody: string
  ): Promise<{ updated: boolean; id: number; text_body: string }> {
    return new Promise((resolve, reject) => {
      this.db.run(QUERIES.PROTOCARDS.UPDATE, [textBody, id], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          updated: this.changes > 0,
          id: id,
          text_body: textBody,
        });
      });
    });
  }

  async deleteProtocord(id: number): Promise<{ deleted: boolean }> {
    return new Promise((resolve, reject) => {
      this.db.run(QUERIES.PROTOCARDS.DELETE, [id], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ deleted: this.changes > 0 });
      });
    });
  }
}
