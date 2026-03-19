
import type React from 'react';

export interface Service {
    id: string; // Mapped from Appwrite's $id
    name: string;
    description: string;
    icon: string; 
    created_at: string; // Mapped from Appwrite's $createdAt
    updated_at?: string; // Mapped from Appwrite's $updatedAt
}

export type TicketStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Ticket {
    id: string; // Mapped from Appwrite's $id
    number: number;
    formatted_number: string;
    service_id: string;
    service: Service | null; // Can be null if service data isn't loaded or found
    user_type: UserType;
    status: TicketStatus;
    is_priority: boolean;
    operator_id?: string | null;
    created_at: string; // Mapped from Appwrite's $createdAt
    started_at?: string | null;
    completed_at?: string | null;
    updated_at?: string; // Mapped from Appwrite's $updatedAt
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
