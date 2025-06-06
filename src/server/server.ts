import express from 'express';
import cors from 'cors';
import path from 'path';
import { createProtocardRoutes } from '@/server/routes/protocards';
import { createSSERoutes } from '@/server/routes/sse';
import { createMiscRoutes } from '@/server/routes/misc';
import { initializeDatabase } from '@/server/db/db';
import { errorHandler } from '@/server/middleware/error-handler';
import { ROUTES } from '@/shared/routes';

const app = express();
app.use(cors());
app.use(express.json());
// app.use(express.static('../frontend')); // Serve static files from public directory

// Basic middleware

// Initialize database
const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'db/app.db');

async function startServer() {
  try {
    const { db, repository } = await initializeDatabase(dbPath);

    // Mount route modules
    app.use(ROUTES.BASE, createMiscRoutes(repository));
    app.use(ROUTES.PROTOCARDS.BASE, createProtocardRoutes(repository));
    app.use(ROUTES.SSE, createSSERoutes());

    // Error handling middleware (must be last)
    app.use(errorHandler);

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
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
