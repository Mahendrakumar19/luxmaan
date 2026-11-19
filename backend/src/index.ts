import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    runtime: 'Node.js',
    nodeVersion: process.version,
    service: 'JobAgent.Backend.Node',
    region: 'AWS Frankfurt (eu-central-1)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`[JobAgent Node Backend] Server running on http://localhost:${PORT}`);
  console.log(`[JobAgent Node Backend] Ready for requests at http://localhost:${PORT}/api/v1`);
});
