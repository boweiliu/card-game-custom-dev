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
    INSERT_WITH_ID: 'INSERT INTO game_snapshots (id, prior_snapshot_id, phys_cards) VALUES (?, ?, ?)',
    GET_BY_ID: 'SELECT * FROM game_snapshots WHERE id = ?',
    SELECT_ALL: 'SELECT * FROM game_snapshots ORDER BY created_at DESC',
    GET_CHAIN: 'WITH RECURSIVE snapshot_chain(id, prior_snapshot_id, phys_cards, created_at, level) AS (SELECT id, prior_snapshot_id, phys_cards, created_at, 0 FROM game_snapshots WHERE id = ? UNION ALL SELECT s.id, s.prior_snapshot_id, s.phys_cards, s.created_at, sc.level + 1 FROM game_snapshots s JOIN snapshot_chain sc ON s.id = sc.prior_snapshot_id) SELECT * FROM snapshot_chain ORDER BY level',
  },
};
