import sqlite3, { Database } from 'sqlite3';
import { TABLE_SCHEMAS } from '@/server/db/sql/schemas';
import { DatabaseRepository } from '@/server/db/repository';

// Database initialization
export function initializeDatabase(dbPath: string): {
  db: Database;
  repository: DatabaseRepository;
} {
  console.log('loading dbPath', { dbPath });
  const db = new sqlite3.Database(dbPath);

  // Create tables if they don't exist
  db.serialize(() => {
    db.run(TABLE_SCHEMAS.COUNT_CALLS);
    db.run(TABLE_SCHEMAS.PROTOCARDS);
  });

  const repository = new DatabaseRepository(db);

  return { db, repository };
}
