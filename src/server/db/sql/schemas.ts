// Table creation SQL
export const TABLE_SCHEMAS = {
  COUNT_CALLS: `CREATE TABLE IF NOT EXISTS count_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  PROTOCARDS: `CREATE TABLE IF NOT EXISTS protocards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text_body TEXT NOT NULL,
    created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now', 'utc') || 'Z'),
    updated_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now', 'utc') || 'Z')
  )`,
};
