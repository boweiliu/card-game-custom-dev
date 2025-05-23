import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../public')); // Serve static files from public directory

// Initialize SQLite database
const dbPath = path.join(__dirname, '../../db/app.db');
const db = new sqlite3.Database(dbPath);

// Create count table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS count_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// API endpoints
app.get('/api/ping', async (req, res) => {
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
app.post('/api/count', (req, res) => {
  db.run('INSERT INTO count_calls DEFAULT VALUES', function (err) {
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
        id: this.lastID,
      });
    });
  });
});

// All non-API endpoints should serve the index.html
app.get('/*', (req, res) => {
  // if in dev mode, serve a redirect to the correct port
  if (process.env.NODE_ENV === 'development') {
    const DEFAULT_FE_PORT = 9001;
    const FE_PORT = process.env.FE_PORT || DEFAULT_FE_PORT;
    console.log('redirecting to ', FE_PORT);
    res.redirect(`http://localhost:${FE_PORT}`);
    return;
  }

  // otherwise serve file at that path
  res.sendFile(req.path, { root: './dist/frontend' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
