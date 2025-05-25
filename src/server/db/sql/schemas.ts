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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phys_cards TEXT NOT NULL, -- JSON serialized PhysCard[]
    created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now', 'utc') || 'Z')
  )`,

  GAME_ACTIONS: `CREATE TABLE IF NOT EXISTS game_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_action_id INTEGER, -- can be null for root actions
    snapshot_id INTEGER NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('user', 'triggered', 'system')),
    action_name TEXT NOT NULL CHECK (action_name IN ('draw_card', 'play_card', 'shuffle_deck', 'move_card', 'create_card')),
    action_data TEXT NOT NULL, -- JSON serialized action-specific data
    created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now', 'utc') || 'Z'),
    FOREIGN KEY (parent_action_id) REFERENCES game_actions(id),
    FOREIGN KEY (snapshot_id) REFERENCES game_snapshots(id)
  )`,
};
