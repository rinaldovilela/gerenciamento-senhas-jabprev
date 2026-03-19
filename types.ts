

import type React from 'react';

export interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    prefix: string;
    icon: React.ReactNode;
}

export type TicketStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Ticket {
    id: string;
    number: number;
    formattedNumber: string;
    service: Service;
    createdAt: Date;
    userType: UserType;
    status: TicketStatus;
    isPriority: boolean;
    operator?: User | null;
    startedAt?: Date | null;
    completedAt?: Date | null;
}

export interface QueueState {
    tickets: Ticket[];
    counters: Record<string, number>;
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