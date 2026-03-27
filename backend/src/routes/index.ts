import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import queueRoutes from './queue.routes';
import adminRoutes from './admin.routes';

export function createRoutes(): Router {
  const router = Router();

  // Health check (public)
  router.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth routes
  router.use('/auth', authRoutes);

  // Queue routes (user + operator)
  router.use('/queue/tickets', queueRoutes);

  // Admin routes
  router.use('/admin', adminRoutes);

  return router;
}
