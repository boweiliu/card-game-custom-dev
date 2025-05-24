import { Router } from 'express';
import { Database } from 'sqlite3';
import { CreateProtocardRequest, UpdateProtocardRequest, ProtocardCountResponse } from '@/shared/types/api';
import { Protocard } from '@/shared/types/db';

export function createProtocardRoutes(db: Database): Router {
  const router = Router();

  // Get all protocards
  router.get('/', (req, res) => {
    db.all('SELECT * FROM protocards ORDER BY created_at DESC', (err, rows: Protocard[]) => {
      if (err) {
        console.error('Error fetching protocards:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      res.json(rows);
    });
  });

  // Get protocards count
  router.get('/count', (req, res) => {
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

  // Create new protocard
  router.post('/', (req, res) => {
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

  // Update protocard
  router.put('/:id', (req, res) => {
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

  // Delete protocard
  router.delete('/:id', (req, res) => {
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

  return router;
}