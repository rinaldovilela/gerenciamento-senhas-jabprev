import { Router } from 'express';
import { authMiddleware, operatorOnlyMiddleware, validateRequest } from '../middleware';
import * as queueController from '../controllers/queueController';
import Joi from 'joi';

const router = Router();

const createTicketSchema = Joi.object({
  service: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  description: Joi.string(),
});

const updateTicketSchema = Joi.object({
  status: Joi.string().valid('waiting', 'in_progress', 'completed', 'cancelled', 'no_show'),
  attendantId: Joi.string(),
  notes: Joi.string(),
});

router.post('/', authMiddleware, validateRequest(createTicketSchema), queueController.createTicket);
router.get('/', authMiddleware, queueController.listTickets);
router.get('/:id', authMiddleware, queueController.getTicket);
router.patch('/:id', authMiddleware, operatorOnlyMiddleware, validateRequest(updateTicketSchema), queueController.updateTicket);
router.delete('/:id', authMiddleware, operatorOnlyMiddleware, queueController.deleteTicket);

export default router;
