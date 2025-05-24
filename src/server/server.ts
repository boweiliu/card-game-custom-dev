import express from 'express';
import cors from 'cors';
import { createProtocardRoutes } from '@/server/routes/protocards';
import { createSSERoutes } from '@/server/routes/sse';
import { createMiscRoutes } from '@/server/routes/misc';
import { initializeDatabase } from '@/server/db/db';
import { errorHandler } from '@/server/middleware/error-handler';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../public')); // Serve static files from public directory

// Basic middleware

// Initialize database
const { db, repository } = initializeDatabase(__dirname);

// Mount route modules
app.use('/api', createMiscRoutes(repository));
app.use('/api/protocards', createProtocardRoutes(repository));
app.use('/api/events', createSSERoutes());

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
