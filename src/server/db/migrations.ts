import { Database } from 'sqlite3';

interface Migration {
  id: string;
  description: string;
  up: (db: Database) => Promise<void>;
}

export const MIGRATIONS: Migration[] = [
  {
    id: '001_fix_timestamp_format',
    description: 'Fix timestamp format to use ISO strings',
    up: async (db: Database): Promise<void> => {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          // Create backup table with old data
          db.run(`CREATE TABLE protocards_backup AS SELECT * FROM protocards`);

          // Drop original table
          db.run(`DROP TABLE protocards`);

          // Create new table with correct schema
          db.run(`CREATE TABLE protocards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text_body TEXT NOT NULL,
            created_at DATETIME DEFAULT (datetime('now','utc') || 'Z'),
            updated_at DATETIME DEFAULT (datetime('now','utc') || 'Z')
          )`);

          // Migrate data with timestamp conversion
          db.run(
            `INSERT INTO protocards (id, text_body, created_at, updated_at)
            SELECT 
              id, 
              text_body,
              CASE 
                WHEN created_at LIKE '%Z' THEN created_at
                ELSE datetime(created_at, 'utc') || 'Z'
              END,
              CASE 
                WHEN updated_at LIKE '%Z' THEN updated_at
                ELSE datetime(updated_at, 'utc') || 'Z'
              END
            FROM protocards_backup`,
            (err) => {
              if (err) {
                reject(err);
                return;
              }

              // Drop backup table
              db.run(`DROP TABLE protocards_backup`, (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                console.log('✅ Migration 001_fix_timestamp_format completed');
                resolve();
              });
            }
          );
        });
      });
    },
  },
  {
    id: '002_fix_iso_timestamp_format',
    description:
      'Fix timestamp format to proper ISO with T separator and milliseconds',
    up: async (db: Database): Promise<void> => {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          // Create backup table with old data
          db.run(`CREATE TABLE protocards_backup AS SELECT * FROM protocards`);

          // Drop original table
          db.run(`DROP TABLE protocards`);

          // Create new table with proper ISO timestamp format
          db.run(`CREATE TABLE protocards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text_body TEXT NOT NULL,
            created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now', 'utc') || 'Z'),
            updated_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now', 'utc') || 'Z')
          )`);

          // Migrate data with proper ISO timestamp conversion
          db.run(
            `INSERT INTO protocards (id, text_body, created_at, updated_at)
            SELECT 
              id, 
              text_body,
              CASE 
                WHEN created_at LIKE '%T%' THEN created_at
                ELSE strftime('%Y-%m-%dT%H:%M:%f', created_at) || 'Z'
              END,
              CASE 
                WHEN updated_at LIKE '%T%' THEN updated_at
                ELSE strftime('%Y-%m-%dT%H:%M:%f', updated_at) || 'Z'
              END
            FROM protocards_backup`,
            (err) => {
              if (err) {
                reject(err);
                return;
              }

              // Drop backup table
              db.run(`DROP TABLE protocards_backup`, (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                console.log(
                  '✅ Migration 002_fix_iso_timestamp_format completed'
                );
                resolve();
              });
            }
          );
        });
      });
    },
  },
];

export async function runMigrations(db: Database): Promise<void> {
  // Create migrations table if it doesn't exist
  await new Promise<void>((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      applied_at DATETIME DEFAULT (datetime('now','utc') || 'Z')
    )`,
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  // Get applied migrations
  const appliedMigrations = await new Promise<string[]>((resolve, reject) => {
    db.all('SELECT id FROM migrations', (err, rows: any[]) => {
      if (err) reject(err);
      else resolve(rows.map((row) => row.id));
    });
  });

  // Run pending migrations
  for (const migration of MIGRATIONS) {
    if (!appliedMigrations.includes(migration.id)) {
      console.log(`🔄 Running migration: ${migration.description}`);
      try {
        await migration.up(db);

        // Record migration as applied
        await new Promise<void>((resolve, reject) => {
          db.run(
            'INSERT INTO migrations (id) VALUES (?)',
            [migration.id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      } catch (error) {
        console.error(`❌ Migration ${migration.id} failed:`, error);
        throw error;
      }
    }
  }

  console.log('✅ All migrations completed');
}
