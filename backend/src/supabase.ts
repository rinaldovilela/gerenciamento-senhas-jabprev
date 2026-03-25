import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

// Client com service_role para ouvir eventos
export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: {
    log_level: 'debug',
  },
});

// Cliente para acessar tabelas públicas
export const supabaseAnon = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

export interface Ticket {
  id: string;
  number: number;
  formatted_number: string;
  service_id: string;
  user_type: 'aposentado' | 'pensionista' | 'servidor_ativo';
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  is_priority: boolean;
  operator_id: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string | null;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at?: string;
}

export async function getTodayTickets(): Promise<Ticket[]> {
  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      service:service_id(id, name, description, icon, created_at)
    `)
    .gte('created_at', todayStart.toISOString())
    .lte('created_at', todayEnd.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching today tickets:', error);
    return [];
  }

  return data || [];
}

export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }

  return data || [];
}
