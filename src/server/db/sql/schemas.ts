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
    phys_cards TEXT NOT NULL, -- JSON serialized PhysCard[]
    created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now', 'utc') || 'Z')
  )`,

  GAME_ACTIONS: `CREATE TABLE IF NOT EXISTS game_actions (
    id TEXT PRIMARY KEY,
    parent_action_id TEXT, -- can be null for root actions
    snapshot_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_name TEXT NOT NULL,
    action_data TEXT NOT NULL, -- JSON serialized action-specific data
    created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now', 'utc') || 'Z'),
    FOREIGN KEY (parent_action_id) REFERENCES game_actions(id),
    FOREIGN KEY (snapshot_id) REFERENCES game_snapshots(id)
  )`,
};
