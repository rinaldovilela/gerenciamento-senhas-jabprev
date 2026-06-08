import { Response } from 'express';
import type { AuthRequest } from '../middleware';
import * as AdminService from '../services/AdminService';
import { supabase } from '../supabase';

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
    const { email, name, role, password, serviceIds, avatarUrl } = req.body;

    const user = await AdminService.createUser({
      email,
      name,
      role: role || 'user',
      password,
      serviceIds,
      avatarUrl,
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
    const { name, email, role, status, password, serviceIds, avatarUrl } = req.body;

    const user = await AdminService.updateUser(req.params.id, {
      name,
      email,
      role,
      status,
      password,
      serviceIds,
      avatarUrl,
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

export async function uploadAvatar(req: AuthRequest, res: Response, next: any) {
  try {
    const { id } = req.params;
    const { fileData, fileName } = req.body;

    // Convert Base64 back to Buffer
    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Determine content type
    const mimeMatch = fileData.match(/^data:(image\/\w+);base64,/);
    const contentType = mimeMatch ? mimeMatch[1] : 'image/png';
    const fileExt = contentType.split('/').pop() || 'png';
    
    const filePath = `user-${id}-${Date.now()}.${fileExt}`;

    // Upload directly to Supabase Storage using service_role client
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType,
        upsert: true
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    res.json({ publicUrl });
  } catch (error: any) {
    next(error);
  }
}
