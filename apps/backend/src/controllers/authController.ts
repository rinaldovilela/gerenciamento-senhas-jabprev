import { Response, Request } from 'express';
import type { AuthRequest } from '../middleware';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { AppError } from '../middleware/errorHandler';
import * as AuthService from '../services/AuthService';
import { supabase } from '../supabase';

export async function register(req: Request, res: Response, next: any) {
  try {
    const { email, password, name } = req.body;

    const user = await AuthService.registerUser(email, password, name);
    
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl },
      config.JWT_SECRET as any,
      { expiresIn: config.JWT_EXPIRY } as any
    );

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl },
      token,
    });
  } catch (error: any) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: any) {
  try {
    const { email, password } = req.body;

    const user = await AuthService.authenticateUser(email, password);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, serviceIds: user.serviceIds, avatarUrl: user.avatarUrl },
      config.JWT_SECRET as any,
      { expiresIn: config.JWT_EXPIRY } as any
    );

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, serviceIds: user.serviceIds, avatarUrl: user.avatarUrl },
      token,
    });
  } catch (error: any) {
    next(error);
  }
}

export async function logout(req: AuthRequest, res: Response, next: any) {
  try {
    // Invalidate token on client-side (or in a token blacklist if using Redis)
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: any) {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AppError(400, 'Refresh token required');
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET as any) as any;
    
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      config.JWT_SECRET as any,
      { expiresIn: config.JWT_EXPIRY } as any
    );

    res.json({ token: newToken });
  } catch (error: any) {
    next(error);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: any) {
  try {
    const userId = req.user!.id;
    const { name, password, avatarUrl } = req.body;

    const updatedUser = await AuthService.updateUserProfile(userId, {
      name,
      password,
      avatarUrl,
    });

    // Sign a new token with updated details so the frontend session is immediately updated
    const token = jwt.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        serviceIds: updatedUser.serviceIds,
        avatarUrl: updatedUser.avatarUrl,
      },
      config.JWT_SECRET as any,
      { expiresIn: config.JWT_EXPIRY } as any
    );

    res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        serviceIds: updatedUser.serviceIds,
        avatarUrl: updatedUser.avatarUrl,
      },
      token,
    });
  } catch (error: any) {
    next(error);
  }
}

export async function uploadProfileAvatar(req: AuthRequest, res: Response, next: any) {
  try {
    const userId = req.user!.id;
    const { fileData, fileName } = req.body;

    // Convert Base64 back to Buffer
    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Determine content type
    const mimeMatch = fileData.match(/^data:(image\/\w+);base64,/);
    const contentType = mimeMatch ? mimeMatch[1] : 'image/png';
    const fileExt = contentType.split('/').pop() || 'png';
    
    const filePath = `user-${userId}-${Date.now()}.${fileExt}`;

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
