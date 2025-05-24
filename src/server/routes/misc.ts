import { Router } from 'express';
import { Database } from 'sqlite3';

export function createMiscRoutes(db: Database): Router {
  const router = Router();

  // Ping endpoint
  router.get('/ping', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    console.log(
      'pinged from ',
      req.ip,
      ' at ',
      new Date().toISOString(),
      ' with host ',
      req.headers.host
    );

    await new Promise((resolve) => setTimeout(resolve, 10000));

    res.json({ message: 'pong' });
  });

  // Count endpoint - records each call in SQLite
  router.post('/count', (req, res) => {
    db.run('INSERT INTO count_calls DEFAULT VALUES', function(err) {
      if (err) {
        console.error('Error inserting count record:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      
      // Get total count
      db.get('SELECT COUNT(*) as total FROM count_calls', (err, row: any) => {
        if (err) {
          console.error('Error getting count:', err);
          res.status(500).json({ error: 'Database error' });
          return;
        }
        
        console.log(`Count endpoint called. Total calls: ${row.total}`);
        res.json({ 
          message: 'Count recorded',
          total: row.total,
          id: this.lastID 
        });
      });
    });
  });

  return router;
}