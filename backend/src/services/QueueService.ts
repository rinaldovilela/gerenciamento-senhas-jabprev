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
        user_id: payload.userId,
        service: payload.service,
        priority: payload.priority,
        description: payload.description,
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
    .select('*')
    .eq('user_id', filters.userId);

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.service) {
    query = query.eq('service', filters.service);
  }

  const { data: tickets, error } = await query;

  if (error) {
    throw new AppError(500, 'Failed to list tickets');
  }

  return tickets.map(mapToTicket);
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

  if (ticket.user_id !== userId) {
    throw new AppError(403, 'Access denied');
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
  const { data: ticket, error } = await supabase
    .from('tickets')
    .update({
      status: updates.status,
      attendant_id: updates.attendantId,
      notes: updates.notes,
      updated_by: updates.updatedBy,
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error || !ticket) {
    throw new AppError(500, 'Failed to update ticket');
  }

  return mapToTicket(ticket);
}

export async function deleteTicket(ticketId: string, userId: string): Promise<void> {
  const ticket = await getTicket(ticketId, userId);

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
    userId: data.user_id,
    service: data.service,
    priority: data.priority,
    status: data.status,
    description: data.description,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
