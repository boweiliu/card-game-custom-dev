import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../public')); // Serve static files from public directory

// API endpoints
app.get('/api/ping', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  console.log('pinged from ', req.ip, ' at ', new Date().toISOString() , ' with host ', req.headers.host);

  await new Promise((resolve) => setTimeout(resolve, 10000));

  res.json({ message: 'pong' });
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
