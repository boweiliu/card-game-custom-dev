import sqlite3, { Database } from 'sqlite3';
import { TABLE_SCHEMAS } from '@/server/db/sql/schemas';
import { DatabaseRepository } from '@/server/db/repository';
import { runMigrations } from '@/server/db/migrations';

async function validateSchemas(db: Database): Promise<boolean> {
  return new Promise((resolve) => {
    // Get all table schemas from database
    db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, rows: any[]) => {
      if (err) {
        console.error('Failed to validate schemas:', err);
        resolve(false);
        return;
      }
      
      const actualSchemas = new Map(rows.map(row => [row.name, row.sql]));
      const tableNameMap: Record<string, string> = {
        'COUNT_CALLS': 'count_calls',
        'PROTOCARDS': 'protocards',
        'GAME_SNAPSHOTS': 'game_snapshots'
      };
      
      console.log('🔍 Validating database schemas...');
      let hasErrors = false;
      
      // Check each expected schema
      Object.entries(TABLE_SCHEMAS).forEach(([schemaKey, expectedSchema]) => {
        const tableName = tableNameMap[schemaKey];
        const actualSchema = actualSchemas.get(tableName);
        
        if (!actualSchema) {
          console.warn(`⚠️  Table '${tableName}' not found in database`);
          hasErrors = true;
          return;
        }
        
        // Normalize schemas for comparison (remove extra whitespace and IF NOT EXISTS)
        const normalizeSchema = (sql: string) => sql
          .replace(/\s+/g, ' ')
          .replace(/IF NOT EXISTS\s+/gi, '')
          .trim();
        const normalizedExpected = normalizeSchema(expectedSchema);
        const normalizedActual = normalizeSchema(actualSchema);
        
        if (normalizedExpected === normalizedActual) {
          console.log(`✅ ${tableName} schema matches`);
        } else {
          console.warn(`⚠️  SCHEMA MISMATCH for table '${tableName}':`);
          console.warn(`   Expected: ${expectedSchema}`);
          console.warn(`   Actual:   ${actualSchema}`);
          hasErrors = true;
        }
      });
      
      // Check for unexpected tables (ignore migrations table)
      const expectedTableNames = new Set([...Object.values(tableNameMap), 'migrations']);
      actualSchemas.forEach((_, tableName) => {
        if (!expectedTableNames.has(tableName)) {
          console.warn(`⚠️  Unexpected table found: '${tableName}'`);
        }
      });
      
      resolve(!hasErrors);
    });
  });
}

// Database initialization
export async function initializeDatabase(dbPath: string): Promise<{
  db: Database;
  repository: DatabaseRepository;
}> {
  console.log('loading dbPath', { dbPath });
  const db = new sqlite3.Database(dbPath);

  // Check command line arguments
  const shouldMigrate = process.argv.includes('--migrate');
  const migrateOnly = process.argv.includes('--migrate-only');

  return new Promise((resolve, reject) => {
    // Create tables if they don't exist
    db.serialize(async () => {
      db.run(TABLE_SCHEMAS.COUNT_CALLS);
      db.run(TABLE_SCHEMAS.PROTOCARDS);
      db.run(TABLE_SCHEMAS.GAME_SNAPSHOTS);
      
      try {
        // Run migrations if requested
        if (shouldMigrate || migrateOnly) {
          console.log('🔄 Running migrations...');
          await runMigrations(db);
          
          if (migrateOnly) {
            console.log('✅ Migrations complete. Exiting.');
            process.exit(0);
          }
        }
        
        // Verify schema matches expectations
        const isValid = await validateSchemas(db);
        
        if (!isValid && !shouldMigrate && !migrateOnly) {
          console.error('❌ Schema validation failed!');
          console.error('💡 Run with --migrate flag to automatically fix schema issues');
          console.error('   Example: npm run dev:be -- --migrate');
          console.error('   Or run: npm run migrate');
          process.exit(1);
        }
        
        const repository = new DatabaseRepository(db);
        resolve({ db, repository });
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
        reject(error);
      }
    });
  });
}
