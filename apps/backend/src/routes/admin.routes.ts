import { Router } from 'express';
import { authMiddleware, adminOnlyMiddleware, validateRequest } from '../middleware';
import * as adminController from '../controllers/adminController';
import Joi from 'joi';

const router = Router();

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  role: Joi.string().valid('user', 'operator', 'admin').default('user'),
  password: Joi.string().min(8).required(),
  serviceIds: Joi.array().items(Joi.string()).optional(),
});

const updateUserSchema = Joi.object({
  name: Joi.string(),
  role: Joi.string().valid('user', 'operator', 'admin'),
  email: Joi.string().email(),
  status: Joi.string().valid('active', 'inactive', 'blocked'),
  password: Joi.string().min(8),
  serviceIds: Joi.array().items(Joi.string()).optional(),
}).min(1);

router.get('/dashboard', authMiddleware, adminOnlyMiddleware, adminController.getDashboard);
router.get('/metrics', authMiddleware, adminOnlyMiddleware, adminController.getMetrics);
router.post('/users', authMiddleware, adminOnlyMiddleware, validateRequest(createUserSchema), adminController.createUser);
router.get('/users', authMiddleware, adminOnlyMiddleware, adminController.listUsers);
router.patch('/users/:id', authMiddleware, adminOnlyMiddleware, validateRequest(updateUserSchema), adminController.updateUser);
router.delete('/users/:id', authMiddleware, adminOnlyMiddleware, adminController.deleteUser);

export default router;
