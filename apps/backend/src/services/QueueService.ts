import { AppError } from '../middleware/errorHandler';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

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

export type TicketUserType = 'aposentado' | 'pensionista' | 'servidor_ativo';

export interface CreateTicketInput {
  serviceId: string;
  userType: TicketUserType;
  isPriority: boolean;
  attendeeName?: string;
}

/**
 * Linha da tabela `tickets` como retornada pela funcao `create_ticket`.
 * O totem depende de `number` e `formatted_number`, por isso a criacao
 * retorna a linha crua em vez do formato reduzido de `mapToTicket`.
 */
export interface TicketRow {
  id: string;
  number: number;
  formatted_number: string;
  attendee_name: string | null;
  service_id: string;
  user_type: TicketUserType;
  status: string;
  is_priority: boolean;
  operator_id: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string | null;
  ouvidoria_classification: string | null;
}

/**
 * Cria uma senha delegando para a funcao `public.create_ticket`, que e a unica
 * responsavel pela numeracao diaria por prefixo (com advisory lock contra
 * duplicidade em requisicoes concorrentes).
 */
export async function createTicket(input: CreateTicketInput): Promise<TicketRow> {
  const { data: ticket, error } = await supabase.rpc('create_ticket', {
    p_service_id: input.serviceId,
    p_user_type: input.userType,
    p_is_priority: input.isPriority,
    p_attendee_name: input.attendeeName?.trim() || null,
  });

  if (error) {
    logger.error('[QueueService.createTicket] falha na RPC create_ticket', error);
    throw new AppError(500, 'Failed to create ticket');
  }

  if (!ticket) {
    logger.error('[QueueService.createTicket] RPC create_ticket retornou vazio');
    throw new AppError(500, 'Failed to create ticket');
  }

  return ticket as TicketRow;
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
