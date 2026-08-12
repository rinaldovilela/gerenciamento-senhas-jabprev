import { Response } from 'express';
import type { AuthRequest } from '../middleware';
import * as QueueService from '../services/QueueService';
import { logger } from '../utils/logger';

export async function createTicket(req: AuthRequest, res: Response, next: any) {
  try {
    const { serviceId, userType, isPriority, attendeeName } = req.body;

    const ticket = await QueueService.createTicket({
      serviceId,
      userType,
      isPriority: isPriority ?? false,
      attendeeName,
    });

    logger.info(
      `Senha ${ticket.formatted_number} emitida por ${req.user!.email} (${req.user!.id})`
    );

    res.status(201).json(ticket);
  } catch (error: any) {
    next(error);
  }
}

export async function listTickets(req: AuthRequest, res: Response, next: any) {
  try {
    const { status, service } = req.query;

    const tickets = await QueueService.listTickets({
      userId: req.user!.id,
      status: status as string,
      service: service as string,
    });

    res.json(tickets);
  } catch (error: any) {
    next(error);
  }
}

export async function getTicket(req: AuthRequest, res: Response, next: any) {
  try {
    const ticket = await QueueService.getTicket(req.params.id, req.user!.id);
    res.json(ticket);
  } catch (error: any) {
    next(error);
  }
}

export async function updateTicket(req: AuthRequest, res: Response, next: any) {
  try {
    const { status, attendantId, notes } = req.body;

    const ticket = await QueueService.updateTicket(req.params.id, {
      status,
      attendantId,
      notes,
      updatedBy: req.user!.id,
    });

    res.json(ticket);
  } catch (error: any) {
    next(error);
  }
}

export async function deleteTicket(req: AuthRequest, res: Response, next: any) {
  try {
    await QueueService.deleteTicket(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (error: any) {
    next(error);
  }
}
