import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDatabase } from '../server/config/db.js';
import authRoutes from '../server/routes/authRoutes.js';
import leaveRoutes from '../server/routes/leaveRoutes.js';
import employeeRoutes from '../server/routes/employeeRoutes.js';

const app = express();

// Initialize Database connection on request if needed
let isInitialized = false;
async function ensureDb() {
  if (!isInitialized) {
    try {
      await initDatabase();
      isInitialized = true;
    } catch (err) {
      console.error('Failed to init db in serverless function:', err);
    }
  }
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (_req, _res, next) => {
  await ensureDb();
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/employees', employeeRoutes);

// Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err) {
    console.error('Server error handler:', err.message);
    return res.status(err.status || 400).json({
      success: false,
      message: err.message || 'An unexpected server error occurred.'
    });
  }
});

export default app;
