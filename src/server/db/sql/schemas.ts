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

  GAME_SNAPSHOTS: `CREATE TABLE IF NOT EXISTS game_snapshots (
    id TEXT PRIMARY KEY,
    prior_snapshot_id TEXT, -- can be null for initial snapshot
    phys_cards TEXT NOT NULL, -- JSON serialized PhysCard[]
    created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now', 'utc') || 'Z'),
    FOREIGN KEY (prior_snapshot_id) REFERENCES game_snapshots(id)
  )`,
};
