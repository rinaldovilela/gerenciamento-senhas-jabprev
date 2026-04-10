import { supabase } from './index';

export const userQueries = {
  async getById(id: string) {
    return supabase.from('users').select('*').eq('id', id).single();
  },

  async getByEmail(email: string) {
    return supabase.from('users').select('*').eq('email', email).single();
  },

  async list(filters?: { role?: string; status?: string; limit?: number; offset?: number }) {
    let query = supabase.from('users').select('*');

    if (filters?.role) query = query.eq('role', filters.role);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);

    return query;
  },

  async create(user: any) {
    return supabase.from('users').insert([user]).select().single();
  },

  async update(id: string, updates: any) {
    return supabase.from('users').update(updates).eq('id', id).select().single();
  },

  async delete(id: string) {
    return supabase.from('users').delete().eq('id', id);
  },
};

export const ticketQueries = {
  async getById(id: string) {
    return supabase.from('tickets').select('*').eq('id', id).single();
  },

  async list(filters?: { status?: string; service?: string; user_id?: string; limit?: number }) {
    let query = supabase.from('tickets').select('*');

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.service) query = query.eq('service', filters.service);
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.limit) query = query.limit(filters.limit);

    return query.order('created_at', { ascending: false });
  },

  async create(ticket: any) {
    return supabase.from('tickets').insert([ticket]).select().single();
  },

  async update(id: string, updates: any) {
    return supabase.from('tickets').update(updates).eq('id', id).select().single();
  },

  async delete(id: string) {
    return supabase.from('tickets').delete().eq('id', id);
  },

  async getTodayCount() {
    const today = new Date().toISOString().split('T')[0];
    return supabase
      .from('tickets')
      .select('id')
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`);
  },

  async getByStatus(status: string) {
    return supabase.from('tickets').select('*').eq('status', status).order('created_at', { ascending: true });
  },
};

export const attendanceQueries = {
  async start(ticketId: string, attendantId: string) {
    return supabase
      .from('attendance_records')
      .insert([{ ticket_id: ticketId, attendant_id: attendantId, start_time: new Date().toISOString() }])
      .select()
      .single();
  },

  async end(recordId: string) {
    return supabase
      .from('attendance_records')
      .update({ end_time: new Date().toISOString() })
      .eq('id', recordId)
      .select()
      .single();
  },

  async getByAttendant(attendantId: string, limit?: number) {
    let query = supabase.from('attendance_records').select('*').eq('attendant_id', attendantId);

    if (limit) query = query.limit(limit);

    return query.order('start_time', { ascending: false });
  },
};
