// Query templates
export const QUERIES = {
  // Count calls queries
  COUNT_CALLS: {
    INSERT: 'INSERT INTO count_calls DEFAULT VALUES',
    GET_TOTAL: 'SELECT COUNT(*) as total FROM count_calls',
  },

  // Protocards queries
  PROTOCARDS: {
    SELECT_ALL: 'SELECT * FROM protocards ORDER BY created_at DESC',
    SELECT_COUNT: 'SELECT COUNT(*) as count FROM protocards',
    INSERT: 'INSERT INTO protocards (text_body) VALUES (?) RETURNING *',
    UPDATE:
      'UPDATE protocards SET text_body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
    DELETE: 'DELETE FROM protocards WHERE id = ? RETURNING *',
  },
};
