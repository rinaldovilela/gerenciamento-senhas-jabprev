import { Router } from 'express';
import { authMiddleware, validateRequest } from '../middleware';
import * as authController from '../controllers/authController';
import Joi from 'joi';

const router = Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().required(),
  password: Joi.string().trim().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().optional(),
  password: Joi.string().min(8).optional(),
  avatarUrl: Joi.string().allow('').optional(),
}).min(1);

const uploadAvatarSchema = Joi.object({
  fileData: Joi.string().required(),
  fileName: Joi.string().required(),
});

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh', authController.refreshToken);
router.patch('/profile', authMiddleware, validateRequest(updateProfileSchema), authController.updateProfile);
router.post('/profile/avatar', authMiddleware, validateRequest(uploadAvatarSchema), authController.uploadProfileAvatar);

export default router;
