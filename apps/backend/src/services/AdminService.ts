import { AppError } from '../middleware/errorHandler';
import { supabase } from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  serviceIds?: string[];
  avatarUrl?: string;
}

export interface Dashboard {
  totalUsers: number;
  totalTickets: number;
  ticketsInService: number;
  completedToday: number;
}

export async function getDashboard(): Promise<Dashboard> {
  const { data: stats, error } = await supabase
    .rpc('get_dashboard_stats', {});

  if (error) {
    throw new AppError(500, 'Failed to get dashboard');
  }

  return stats || {};
}

export async function getMetrics() {
  const { data: metrics, error } = await supabase
    .rpc('get_metrics', {});

  if (error) {
    throw new AppError(500, 'Failed to get metrics');
  }

  return metrics || {};
}

export async function createUser(payload: {
  email: string;
  name: string;
  role: string;
  password: string;
  createdBy: string;
  serviceIds?: string[];
  avatarUrl?: string;
}): Promise<User> {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', payload.email)
    .single();

  if (existing) {
    throw new AppError(409, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const { data: user, error } = await supabase
    .from('users')
    .insert([
      {
        email: payload.email,
        name: payload.name,
        role: payload.role,
        password_hash: hashedPassword,
        status: 'active',
        avatar_url: payload.avatarUrl,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Failed to create user');
  }

  if (payload.serviceIds && payload.serviceIds.length > 0) {
    const serviceInserts = payload.serviceIds.map((serviceId) => ({
      user_id: user.id,
      service_id: serviceId,
    }));
    await supabase.from('user_services').insert(serviceInserts);
  }

  return { ...mapToUser(user), serviceIds: payload.serviceIds || [] };
}

export async function listUsers(filters: {
  role?: string;
  status?: string;
}): Promise<User[]> {
  let query = supabase.from('users').select('*, user_services(service_id)');

  if (filters.role) {
    query = query.eq('role', filters.role);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data: users, error } = await query;

  if (error) {
    throw new AppError(500, 'Failed to list users');
  }

  return (users || []).map((u) => {
    const mapped = mapToUser(u);
    mapped.serviceIds = u.user_services?.map((us: any) => us.service_id) || [];
    return mapped;
  });
}

export async function updateUser(
  userId: string,
  updates: {
    name?: string;
    email?: string;
    role?: string;
    status?: string;
    password?: string;
    serviceIds?: string[];
    avatarUrl?: string;
    updatedBy: string;
  }
): Promise<User> {
  const { name, email, role, status, password, serviceIds, avatarUrl } = updates;
  const updateData: Record<string, any> = {};

  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (role !== undefined) updateData.role = role;
  if (status !== undefined) updateData.status = status;
  if (password !== undefined) {
    updateData.password_hash = await bcrypt.hash(password, 10);
  }
  if (avatarUrl !== undefined) {
    updateData.avatar_url = avatarUrl;
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      throw new AppError(500, 'Failed to update user');
    }
  }

  if (serviceIds !== undefined) {
    await supabase.from('user_services').delete().eq('user_id', userId);
    if (serviceIds.length > 0) {
      const serviceInserts = serviceIds.map((serviceId) => ({
        user_id: userId,
        service_id: serviceId,
      }));
      await supabase.from('user_services').insert(serviceInserts);
    }
  }

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*, user_services(service_id)')
    .eq('id', userId)
    .single();

  if (fetchError || !user) {
    throw new AppError(500, 'Failed to fetch updated user');
  }

  const mapped = mapToUser(user);
  mapped.serviceIds = user.user_services?.map((us: any) => us.service_id) || [];
  return mapped;
}

export async function deleteUser(userId: string, requestedBy: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    throw new AppError(500, 'Failed to delete user');
  }
}

function mapToUser(data: any): User {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    status: data.status,
    avatarUrl: data.avatar_url,
  };
}
