// Query templates
export const QUERIES = {
  // Count calls queries
  COUNT_CALLS: {
    INSERT: 'INSERT INTO count_calls DEFAULT VALUES',
    GET_COUNT: 'SELECT COUNT(*) as count FROM count_calls',
  },

  // Protocards queries
  PROTOCARDS: {
    SELECT_ALL: 'SELECT * FROM protocards ORDER BY created_at DESC',
    GET_COUNT: 'SELECT COUNT(*) as count FROM protocards',
    INSERT: 'INSERT INTO protocards (text_body) VALUES (?) RETURNING *',
    UPDATE:
      'UPDATE protocards SET text_body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
    DELETE: 'DELETE FROM protocards WHERE id = ? RETURNING *',
  },

  // Game snapshots queries
  GAME_SNAPSHOTS: {
    INSERT: 'INSERT INTO game_snapshots (phys_cards) VALUES (?)',
    INSERT_WITH_ID: 'INSERT INTO game_snapshots (id, phys_cards) VALUES (?, ?)',
    GET_BY_ID: 'SELECT * FROM game_snapshots WHERE id = ?',
    SELECT_ALL: 'SELECT * FROM game_snapshots ORDER BY created_at DESC',
  },

  // Game actions queries
  GAME_ACTIONS: {
    INSERT: 'INSERT INTO game_actions (parent_action_id, snapshot_id, action_type, action_name, action_data) VALUES (?, ?, ?, ?, ?)',
    INSERT_WITH_ID: 'INSERT INTO game_actions (id, parent_action_id, snapshot_id, action_type, action_name, action_data) VALUES (?, ?, ?, ?, ?, ?)',
    GET_BY_ID: 'SELECT * FROM game_actions WHERE id = ?',
    GET_BY_SNAPSHOT: 'SELECT * FROM game_actions WHERE snapshot_id = ? ORDER BY created_at ASC',
    GET_BY_PARENT: 'SELECT * FROM game_actions WHERE parent_action_id = ? ORDER BY created_at ASC',
    SELECT_ALL: 'SELECT * FROM game_actions ORDER BY created_at DESC',
  },
};
