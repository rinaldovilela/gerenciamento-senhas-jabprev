import { Response, Request } from 'express';
import type { AuthRequest } from '../middleware';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { AppError } from '../middleware/errorHandler';
import * as AuthService from '../services/AuthService';

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
