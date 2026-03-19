
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { QueueState, Ticket, Service, UserType, User, TicketStatus } from '../types';
import { SERVICES } from '../constants';


interface QueueContextType {
    tickets: Ticket[];
    addTicket: (service: Service, userType: UserType, isPriority: boolean) => Ticket;
    callNextTicket: (serviceId: string) => void;
    updateTicketStatus: (ticketId: string, status: TicketStatus, operator: User) => void;
    calledTicket: Ticket | null;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

type Action = 
    | { type: 'ADD_TICKET'; payload: Ticket }
    | { type: 'CALL_NEXT_TICKET'; payload: Ticket }
    | { type: 'UPDATE_TICKET_STATUS'; payload: { ticketId: string; status: TicketStatus; operator: User } };

// Mock data generation for a more realistic initial state
const generateInitialTickets = (): Ticket[] => {
    const tickets: Ticket[] = [];
    const userTypes: UserType[] = ['aposentado', 'pensionista', 'servidor_ativo'];
    const counters: Record<string, number> = {};

    for (let i = 0; i < 35; i++) {
        const userType = userTypes[i % 3];
        const service = SERVICES[i % SERVICES.length];
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 8 * 60 * 60 * 1000)); // within last 8 hours
        const prefix = { aposentado: 'APO', pensionista: 'PEN', servidor_ativo: 'ATV' }[userType];
        
        const nextNumber = (counters[prefix] || 0) + 1;
        counters[prefix] = nextNumber;

        const newTicket: Ticket = {
            id: `${prefix}-${nextNumber}-${createdAt.getTime()}`,
            number: nextNumber,
            formattedNumber: `${prefix}-${String(nextNumber).padStart(3, '0')}`,
            service,
            createdAt,
            userType,
            status: 'waiting',
            isPriority: false,
        };
        tickets.push(newTicket);
    }

    // Pre-populate some tickets with different statuses for demonstration
    if (tickets.length > 5) {
        tickets[1].status = 'in_progress';
        tickets[1].startedAt = new Date(tickets[1].createdAt.getTime() + 60000);
        tickets[3].status = 'completed';
        tickets[3].startedAt = new Date(tickets[3].createdAt.getTime() + 60000);
        tickets[3].completedAt = new Date(tickets[3].createdAt.getTime() + 300000);
        tickets[5].status = 'cancelled';
    }
    
    return tickets.sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
};


const initialState: QueueState = {
    tickets: generateInitialTickets(),
    counters: {},
    calledTicket: null,
};

const USER_TYPE_PREFIX: Record<UserType, string> = {
    aposentado: 'APO',
    pensionista: 'PEN',
    servidor_ativo: 'ATV',
};

const queueReducer = (state: QueueState, action: Action): QueueState => {
    switch (action.type) {
        case 'ADD_TICKET': {
            const newTicket = action.payload;
            const prefix = newTicket.formattedNumber.split('-')[0];
            return {
                ...state,
                tickets: [...state.tickets, newTicket].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
                counters: {
                    ...state.counters,
                    [prefix]: (state.counters[prefix] || 0) + 1,
                },
            };
        }
        case 'CALL_NEXT_TICKET': {
            // This is now more of a visual cue than a state change
            return {
                ...state,
                calledTicket: action.payload,
            };
        }
        case 'UPDATE_TICKET_STATUS': {
            const { ticketId, status, operator } = action.payload;
            return {
                ...state,
                tickets: state.tickets.map(ticket => {
                    if (ticket.id === ticketId) {
                        const updatedTicket: Ticket = { ...ticket, status, operator };
                        if (status === 'in_progress' && !ticket.startedAt) {
                            updatedTicket.startedAt = new Date();
                        } else if ((status === 'completed' || status === 'cancelled' || status === 'no_show') && !ticket.completedAt) {
                            updatedTicket.completedAt = new Date();
                        }
                        return updatedTicket;
                    }
                    return ticket;
                })
            };
        }
        default:
            return state;
    }
};

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(queueReducer, initialState);

    const addTicket = useCallback((service: Service, userType: UserType, isPriority: boolean): Ticket => {
        const prefix = isPriority ? 'PRIO' : USER_TYPE_PREFIX[userType];
        const nextNumber = (state.counters[prefix] || 0) + 1;
        const newTicket: Ticket = {
            id: `${prefix}-${nextNumber}-${Date.now()}`,
            number: nextNumber,
            formattedNumber: `${prefix}-${String(nextNumber).padStart(3, '0')}`,
            service,
            createdAt: new Date(),
            userType,
            status: 'waiting',
            isPriority,
        };
        dispatch({ type: 'ADD_TICKET', payload: newTicket });
        return newTicket;
    }, [state.counters]);

    const callNextTicket = useCallback((serviceId: string) => {
        const waitingTicketsForService = state.tickets
            .filter(t => t.service.id === serviceId && t.status === 'waiting')
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        
        if (waitingTicketsForService.length > 0) {
            const nextTicket = waitingTicketsForService[0];
            dispatch({ type: 'CALL_NEXT_TICKET', payload: nextTicket });
        }
    }, [state.tickets]);

    const updateTicketStatus = useCallback((ticketId: string, status: TicketStatus, operator: User) => {
        dispatch({ type: 'UPDATE_TICKET_STATUS', payload: { ticketId, status, operator } });
    }, []);

    return (
        <QueueContext.Provider value={{ ...state, addTicket, callNextTicket, updateTicketStatus }}>
            {children}
{/* FIX: Corrected typo in the closing tag for QueueContext.Provider. */}
        </QueueContext.Provider>
    );
};

export const useQueue = (): QueueContextType => {
    const context = useContext(QueueContext);
    if (context === undefined) {
        throw new Error('useQueue must be used within a QueueProvider');
    }
    return context;
};
