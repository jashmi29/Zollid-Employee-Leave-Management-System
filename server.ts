import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './server/config/db.js';
import authRoutes from './server/routes/authRoutes.js';
import leaveRoutes from './server/routes/leaveRoutes.js';
import employeeRoutes from './server/routes/employeeRoutes.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  // Initialize Database & Seeders
  try {
    await initDatabase();
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }

  // Basic Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files for uploaded documents
  const uploadsDir = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/leaves', leaveRoutes);
  app.use('/api/employees', employeeRoutes);

  // Multer & General Error Handling Middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err) {
      console.error('Server error handler:', err.message);
      return res.status(err.status || 400).json({
        success: false,
        message: err.message || 'An unexpected server error occurred.'
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
