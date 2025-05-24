import sqlite3, { Database } from 'sqlite3';
import path from 'path';
import { TABLE_SCHEMAS } from '@/server/db/schemas';
import { DatabaseRepository } from '@/server/db/repository';

// Database initialization
export function initializeDatabase(): {
  db: Database;
  repository: DatabaseRepository;
} {
  const dbPath = path.join(__dirname, '../../../db/app.db');
  const db = new sqlite3.Database(dbPath);

  // Create tables if they don't exist
  db.serialize(() => {
    db.run(TABLE_SCHEMAS.COUNT_CALLS);
    db.run(TABLE_SCHEMAS.PROTOCARDS);
  });

  const repository = new DatabaseRepository(db);

  return { db, repository };
}

export { DatabaseRepository } from '@/server/db/repository';
