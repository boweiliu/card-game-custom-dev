import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { CreateProtocardRequest, UpdateProtocardRequest, Protocard, ProtocardCountResponse } from '@/shared/types';

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

// Protocards API endpoints
app.get('/api/protocards', (req, res) => {
  db.all('SELECT * FROM protocards ORDER BY created_at DESC', (err, rows: Protocard[]) => {
    if (err) {
      console.error('Error fetching protocards:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/protocards/count', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM protocards', (err, row: any) => {
    if (err) {
      console.error('Error counting protocards:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    const response: ProtocardCountResponse = { count: row.count };
    res.json(response);
  });
});

app.post('/api/protocards', (req, res) => {
  const { text_body }: CreateProtocardRequest = req.body;
  
  if (!text_body || typeof text_body !== 'string') {
    res.status(400).json({ error: 'text_body is required and must be a string' });
    return;
  }
  
  db.run('INSERT INTO protocards (text_body) VALUES (?)', [text_body], function(err) {
    if (err) {
      console.error('Error creating protocard:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
    res.status(201).json({ 
      id: this.lastID,
      text_body,
      message: 'Protocard created successfully'
    });
  });
});

app.put('/api/protocards/:id', (req, res) => {
  const { id } = req.params;
  const { text_body }: UpdateProtocardRequest = req.body;
  
  if (!text_body || typeof text_body !== 'string') {
    res.status(400).json({ error: 'text_body is required and must be a string' });
    return;
  }
  
  db.run(
    'UPDATE protocards SET text_body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [text_body, id],
    function(err) {
      if (err) {
        console.error('Error updating protocard:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Protocard not found' });
        return;
      }
      
      res.json({ 
        id: parseInt(id),
        text_body,
        message: 'Protocard updated successfully'
      });
    }
  );
});

app.delete('/api/protocards/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM protocards WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting protocard:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Protocard not found' });
      return;
    }
    
    res.json({ message: 'Protocard deleted successfully' });
  });
});


// Server-Sent Events endpoint
app.get('/api/events', (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  console.log(`[SSE] Connection from IP: ${clientIP}`);

  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Send initial connection event
  res.write('data: {"type": "connected", "message": "SSE connection established"}\n\n');

  // Keep connection alive with periodic heartbeat
  let heartbeatCount = 0;
  let connectionClosed = false;
  
  const heartbeat = setInterval(() => {
    // Check if connection is still alive
    if (connectionClosed || res.destroyed || !res.writable) {
      clearInterval(heartbeat);
      return;
    }
    
    heartbeatCount++;
    const heartbeatData = `data: {"type": "heartbeat", "timestamp": "${new Date().toISOString()}", "count": ${heartbeatCount}}\n\n`;
    
    try {
      res.write(heartbeatData);
    } catch (error) {
      console.error(`[SSE] Error writing heartbeat to IP: ${clientIP}:`, error);
      connectionClosed = true;
      clearInterval(heartbeat);
    }
  }, 3000); // Every 3 seconds

  // Clean up on client disconnect
  req.on('close', () => {
    console.log(`[SSE] Client disconnected: ${clientIP}`);
    connectionClosed = true;
    clearInterval(heartbeat);
  });

  req.on('error', (error) => {
    console.error(`[SSE] Connection error:`, error);
    connectionClosed = true;
    clearInterval(heartbeat);
  });

  res.on('close', () => {
    connectionClosed = true;
    clearInterval(heartbeat);
  });

  res.on('error', (error) => {
    console.error(`[SSE] Response error:`, error);
    connectionClosed = true;
    clearInterval(heartbeat);
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
