import { AppError } from '../middleware/errorHandler';
import { supabase } from '../config/database';

export interface Ticket {
  id: string;
  userId: string;
  service: string;
  priority: 'low' | 'medium' | 'high';
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createTicket(payload: {
  userId: string;
  service: string;
  priority: string;
  description?: string;
}): Promise<Ticket> {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert([
      {
        service_id: payload.service,
        user_type: 'servidor_ativo',
        is_priority: payload.priority === 'high',
        status: 'waiting',
      },
    ])
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Failed to create ticket');
  }

  return mapToTicket(ticket);
}

export async function listTickets(filters: {
  userId: string;
  status?: string;
  service?: string;
}): Promise<Ticket[]> {
  let query = supabase
    .from('tickets')
    .select('*');

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.service) {
    query = query.eq('service_id', filters.service);
  }

  const { data: tickets, error } = await query;

  if (error) {
    console.error('[QueueService.listTickets] supabase error:', error);
    throw new AppError(500, 'Failed to list tickets');
  }

  return (tickets || []).map(mapToTicket);
}

export async function getTicket(ticketId: string, userId: string): Promise<Ticket> {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (error || !ticket) {
    throw new AppError(404, 'Ticket not found');
  }

  return mapToTicket(ticket);
}

export async function updateTicket(
  ticketId: string,
  updates: {
    status?: string;
    attendantId?: string;
    notes?: string;
    updatedBy: string;
  }
): Promise<Ticket> {
  const updatePayload: Record<string, any> = {
    status: updates.status,
    operator_id: updates.attendantId || updates.updatedBy,
  };

  if (updates.status === 'in_progress') {
    updatePayload.started_at = new Date().toISOString();
  }

  if (updates.status && ['completed', 'cancelled', 'no_show'].includes(updates.status)) {
    updatePayload.completed_at = new Date().toISOString();
  }

  const { data: ticket, error } = await supabase
    .from('tickets')
    .update(updatePayload)
    .eq('id', ticketId)
    .select()
    .single();

  if (error || !ticket) {
    throw new AppError(500, 'Failed to update ticket');
  }

  return mapToTicket(ticket);
}

export async function deleteTicket(ticketId: string, userId: string): Promise<void> {
  await getTicket(ticketId, userId);

  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', ticketId);

  if (error) {
    throw new AppError(500, 'Failed to delete ticket');
  }
}

function mapToTicket(data: any): Ticket {
  return {
    id: data.id,
    userId: data.operator_id || '',
    service: data.service_id,
    priority: data.is_priority ? 'high' : 'medium',
    status: data.status,
    description: undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at || data.created_at,
  };
}
