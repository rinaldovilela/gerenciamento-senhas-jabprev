import { Response } from 'express';
import type { AuthRequest } from '../middleware';
import * as AdminService from '../services/AdminService';

export async function getDashboard(req: AuthRequest, res: Response, next: any) {
  try {
    const dashboard = await AdminService.getDashboard();
    res.json(dashboard);
  } catch (error: any) {
    next(error);
  }
}

export async function getMetrics(req: AuthRequest, res: Response, next: any) {
  try {
    const metrics = await AdminService.getMetrics();
    res.json(metrics);
  } catch (error: any) {
    next(error);
  }
}

export async function createUser(req: AuthRequest, res: Response, next: any) {
  try {
    const { email, name, role, password, serviceIds } = req.body;

    const user = await AdminService.createUser({
      email,
      name,
      role: role || 'user',
      password,
      serviceIds,
      createdBy: req.user!.id,
    });

    res.status(201).json(user);
  } catch (error: any) {
    next(error);
  }
}

export async function listUsers(req: AuthRequest, res: Response, next: any) {
  try {
    const { role, status } = req.query;

    const users = await AdminService.listUsers({
      role: role as string,
      status: status as string,
    });

    res.json(users);
  } catch (error: any) {
    next(error);
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: any) {
  try {
    const { name, email, role, status, password, serviceIds } = req.body;

    const user = await AdminService.updateUser(req.params.id, {
      name,
      email,
      role,
      status,
      password,
      serviceIds,
      updatedBy: req.user!.id,
    });

    res.json(user);
  } catch (error: any) {
    next(error);
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: any) {
  try {
    await AdminService.deleteUser(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (error: any) {
    next(error);
  }
}
