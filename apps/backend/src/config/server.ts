import express, { Express } from 'express';
import cors from 'cors';
import { config } from './environment';
import { logger } from '../utils/logger';
import { errorHandler } from '../middleware/errorHandler';

export function createServer(): Express {
  const app = express();
  const allowedOrigins = config.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean);

  // Middleware - Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Middleware - CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API version
  app.get('/api', (req, res) => {
    res.json({ version: config.API_VERSION, message: 'Queue Management API' });
  });

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}
