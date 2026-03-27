import { Router, Request, Response } from 'express';
import { authMiddleware, adminOnlyMiddleware, operatorOnlyMiddleware } from '../middleware';
import * as authController from '../controllers/authController';
import * as queueController from '../controllers/queueController';
import * as adminController from '../controllers/adminController';

export function createRoutes(): Router {
  const router = Router();

  // Health check (public)
  router.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth routes
  router.post('/auth/register', authController.register);
  router.post('/auth/login', authController.login);
  router.post('/auth/logout', authMiddleware, authController.logout);
  router.post('/auth/refresh', authController.refreshToken);

  // Queue routes (user + operator)
  router.post('/queue/ticket', authMiddleware, queueController.createTicket);
  router.get('/queue/tickets', authMiddleware, queueController.listTickets);
  router.get('/queue/tickets/:id', authMiddleware, queueController.getTicket);
  router.patch('/queue/tickets/:id', authMiddleware, operatorOnlyMiddleware, queueController.updateTicket);
  router.delete('/queue/tickets/:id', authMiddleware, operatorOnlyMiddleware, queueController.deleteTicket);

  // Admin routes
  router.get('/admin/dashboard', authMiddleware, adminOnlyMiddleware, adminController.getDashboard);
  router.get('/admin/metrics', authMiddleware, adminOnlyMiddleware, adminController.getMetrics);
  router.post('/admin/users', authMiddleware, adminOnlyMiddleware, adminController.createUser);
  router.get('/admin/users', authMiddleware, adminOnlyMiddleware, adminController.listUsers);
  router.patch('/admin/users/:id', authMiddleware, adminOnlyMiddleware, adminController.updateUser);
  router.delete('/admin/users/:id', authMiddleware, adminOnlyMiddleware, adminController.deleteUser);

  return router;
}
