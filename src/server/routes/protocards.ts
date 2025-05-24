import { Router } from 'express';
import {
  CreateProtocardRequest,
  UpdateProtocardRequest,
  ProtocardCountResponse,
} from '@/shared/types/api';
import { DatabaseRepository } from '@/server/db/repository';

export function createProtocardRoutes(repository: DatabaseRepository): Router {
  const router = Router();

  // Get all protocards
  router.get('/', async (req, res) => {
    try {
      const protocards = await repository.getAllProtocards();
      res.json(protocards);
    } catch (error) {
      console.error('Error fetching protocards:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Get protocards count
  router.get('/count', async (req, res) => {
    try {
      const count = await repository.getProtocardCount();
      const response: ProtocardCountResponse = { count };
      res.json(response);
    } catch (error) {
      console.error('Error counting protocards:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Create new protocard
  router.post('/', async (req, res) => {
    const { text_body }: CreateProtocardRequest = req.body;

    if (!text_body || typeof text_body !== 'string') {
      res
        .status(400)
        .json({ error: 'text_body is required and must be a string' });
      return;
    }

    try {
      const result = await repository.createProtocord(text_body);
      res.status(201).json({
        id: result.id,
        text_body: result.text_body,
        message: 'Protocard created successfully',
      });
    } catch (error) {
      console.error('Error creating protocard:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Update protocard
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { text_body }: UpdateProtocardRequest = req.body;

    if (!text_body || typeof text_body !== 'string') {
      res
        .status(400)
        .json({ error: 'text_body is required and must be a string' });
      return;
    }

    try {
      const result = await repository.updateProtocord(parseInt(id), text_body);

      if (!result.updated) {
        res.status(404).json({ error: 'Protocard not found' });
        return;
      }

      res.json({
        id: result.id,
        text_body: result.text_body,
        message: 'Protocard updated successfully',
      });
    } catch (error) {
      console.error('Error updating protocard:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Delete protocard
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const result = await repository.deleteProtocord(parseInt(id));

      if (!result.deleted) {
        res.status(404).json({ error: 'Protocard not found' });
        return;
      }

      res.json({ message: 'Protocard deleted successfully' });
    } catch (error) {
      console.error('Error deleting protocard:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
}
