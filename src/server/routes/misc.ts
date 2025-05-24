import { Router } from 'express';
import { DatabaseRepository } from '../db';

export function createMiscRoutes(repository: DatabaseRepository): Router {
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
  router.post('/count', async (req, res) => {
    try {
      const result = await repository.insertCountCall();

      console.log(`Count endpoint called. Total calls: ${result.total}`);
      res.json({
        message: 'Count recorded',
        total: result.total,
        id: result.id,
      });
    } catch (error) {
      console.error('Error inserting count record:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
}
