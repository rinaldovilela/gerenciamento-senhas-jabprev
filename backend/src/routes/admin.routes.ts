import { Router } from 'express';
import { adminOnlyMiddleware, validateRequest } from '../middleware';
import * as adminController from '../controllers/adminController';
import * as Joi from 'joi';

const router = Router();

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  role: Joi.string().valid('user', 'operator', 'admin').default('user'),
  password: Joi.string().min(8).required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string(),
  role: Joi.string().valid('user', 'operator', 'admin'),
  email: Joi.string().email(),
  status: Joi.string().valid('active', 'inactive', 'blocked'),
});

router.get('/dashboard', adminOnlyMiddleware, adminController.getDashboard);
router.get('/metrics', adminOnlyMiddleware, adminController.getMetrics);
router.post('/users', adminOnlyMiddleware, validateRequest(createUserSchema), adminController.createUser);
router.get('/users', adminOnlyMiddleware, adminController.listUsers);
router.patch('/users/:id', adminOnlyMiddleware, validateRequest(updateUserSchema), adminController.updateUser);
router.delete('/users/:id', adminOnlyMiddleware, adminController.deleteUser);

export default router;
