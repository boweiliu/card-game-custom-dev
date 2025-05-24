import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { createProtocardRoutes } from './routes/protocards';
import { createSSERoutes } from './routes/sse';
import { createMiscRoutes } from './routes/misc';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../public')); // Serve static files from public directory

// Initialize SQLite database
const dbPath = path.join(__dirname, '../../db/app.db');
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS count_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS protocards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text_body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Mount route modules
app.use('/api', createMiscRoutes(db));
app.use('/api/protocards', createProtocardRoutes(db));
app.use('/api/events', createSSERoutes());


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
