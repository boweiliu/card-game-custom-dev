import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../public')); // Serve static files from public directory

// API endpoints
app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong' });
});

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '../public' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
