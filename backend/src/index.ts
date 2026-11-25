import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { checkDatabaseConnection, getDbStatus } from './db/connection.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check with detailed DB status
app.get('/health', async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  res.json({
    status: 'healthy',
    runtime: 'Node.js',
    nodeVersion: process.version,
    service: 'JobAgent.Backend.Node',
    region: 'AWS Frankfurt (eu-central-1)',
    database: dbStatus,
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

app.listen(PORT, async () => {
  console.log(`[JobAgent Node Backend] Server running on http://localhost:${PORT}`);
  console.log(`[JobAgent Node Backend] Ready for requests at http://localhost:${PORT}/api/v1`);
  
  // Probe PostgreSQL connection on boot
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.isConnected) {
    console.log(`[Database] PostgreSQL CONNECTED successfully: ${dbStatus.host}:${dbStatus.port}/${dbStatus.database} (Latency: ${dbStatus.latencyMs}ms)`);
  } else {
    console.log(`[Database] PostgreSQL NOT ACTIVE at ${dbStatus.host}:${dbStatus.port}/${dbStatus.database}. (${dbStatus.error}).`);
    console.log(`[Database] Operating in memory-state fallback mode for all services.`);
  }
});
