
import type React from 'react';

export interface Service {
    id: string; // Mapped from Appwrite's $id
    name: string;
    description: string;
    icon: string | React.ReactNode; 
    created_at?: string; // Mapped from Appwrite's $createdAt
    updated_at?: string; // Mapped from Appwrite's $updatedAt
    category?: string;
    prefix?: string;
    is_ouvidoria?: boolean;
}

export type TicketStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Ticket {
    id: string; // Mapped from Appwrite's $id
    number: number;
    formatted_number: string;
    attendee_name?: string | null;
    service_id: string;
    service: Service | null; // Can be null if service data isn't loaded or found
    user_type: UserType;
    status: TicketStatus;
    is_priority: boolean;
    operator_id?: string | null;
    operator?: {
        id: string;
        name: string;
        email: string;
    } | null;
    created_at: string; // Mapped from Appwrite's $createdAt
    started_at?: string | null;
    completed_at?: string | null;
    updated_at?: string; // Mapped from Appwrite's $updatedAt
    ouvidoria_classification?: 'informacao' | 'reclamacao' | 'elogio' | null;
}

export interface QueueState {
    tickets: Ticket[];
    services: Service[];
    calledTicket: Ticket | null;
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
}

export type UserRole = 'user' | 'operator' | 'admin';

export enum Screen {
    HOME = 'HOME',
    USER_TYPE_SELECTION = 'USER_TYPE_SELECTION',
    PRIORITY_SELECTION = 'PRIORITY_SELECTION',
    SERVICE_SELECTION = 'SERVICE_SELECTION',
    NAME_INPUT = 'NAME_INPUT',
    TICKET = 'TICKET',
    LOGIN = 'LOGIN',
    RESTRICTED_AREA = 'RESTRICTED_AREA',
    PUBLIC_DISPLAY = 'PUBLIC_DISPLAY'
}

export type UserType = 'aposentado' | 'pensionista' | 'servidor_ativo';

export type Language = 'pt' | 'en';

export interface Translations {
    [key: string]: {
        [lang in Language]: string;
    };
}

// Novos tipos para auditoria e histórico
export interface AuditLogEntry {
    id: string;
    ticket_id: string;
    ticket_number: string;
    old_status: TicketStatus | null;
    new_status: TicketStatus;
    operator_id: string | null;
    operator_name: string | null;
    reason?: string;
    metadata?: Record<string, any>;
    created_at: string;
}

export interface CallHistoryEntry {
    id: string;
    ticket_id: string;
    ticket_number: string;
    operator_id: string | null;
    operator_name: string | null;
    called_at: string;
    duration_seconds?: number;
    result?: 'attended' | 'not_attended' | 'pending';
}
