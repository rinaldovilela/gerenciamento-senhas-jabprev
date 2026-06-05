import { AppError } from '../middleware/errorHandler';
import { supabase } from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'operator' | 'admin';
  createdAt: string;
  serviceIds?: string[];
}

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<User> {
  // Check if user exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    throw new AppError(409, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from('users')
    .insert([
      {
        email,
        password_hash: hashedPassword,
        name,
        role: 'user',
      },
    ])
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Failed to register user');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.created_at,
  };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User> {
  const { data: user, error } = await supabase
    .from('users')
    .select('*, user_services(service_id)')
    .eq('email', email)
    .single();

  if (error || !user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid credentials');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.created_at,
    serviceIds: user.user_services?.map((us: any) => us.service_id) || [],
  };
}

export async function getUserById(userId: string): Promise<User> {
  const { data: user, error } = await supabase
    .from('users')
    .select('*, user_services(service_id)')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new AppError(404, 'User not found');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.created_at,
    serviceIds: user.user_services?.map((us: any) => us.service_id) || [],
  };
}
