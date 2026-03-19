
import type React from 'react';

export interface Service {
    id: string;
    name: string;
    description: string;
    icon: string; // Changed to string for the icon name/ID
    created_at?: string;
}

export type TicketStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Ticket {
    id: string;
    number: number;
    formatted_number: string; // Snake case to match DB
    service_id: string;
    service: Service;
    user_type: UserType; // Snake case to match DB
    status: TicketStatus;
    is_priority: boolean; // Snake case to match DB
    operator_id?: string | null;
    created_at: string; // ISO String from DB
    started_at?: string | null;
    completed_at?: string | null;
}

export interface QueueState {
    tickets: Ticket[];
    services: Service[];
    calledTicket: Ticket | null;
}

export interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'OPERATOR';
}

export enum Screen {
    HOME = 'HOME',
    USER_TYPE_SELECTION = 'USER_TYPE_SELECTION',
    PRIORITY_SELECTION = 'PRIORITY_SELECTION',
    SERVICE_SELECTION = 'SERVICE_SELECTION',
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
