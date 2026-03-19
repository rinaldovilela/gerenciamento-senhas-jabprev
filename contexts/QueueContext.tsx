
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import type { Ticket, Service, UserType, TicketStatus } from '../types';
import { useAuth } from './AuthContext'; // Assuming you have an AuthContext to get the operator

// --- Type Definitions ---
// It's a good practice to have Supabase generate these types for you
// After running `supabase gen types typescript > types/supabase.ts`, you can do:
// import type { Database } from '../types/supabase';
// type TicketWithService = Database['public']['Tables']['tickets']['Row'] & { services: Database['public']['Tables']['services']['Row'] };

interface QueueContextType {
    tickets: Ticket[];
    services: Service[];
    calledTicket: Ticket | null;
    addTicket: (serviceId: string, userType: UserType, isPriority: boolean) => Promise<Ticket | null>;
    callNextTicket: (serviceId: string) => Promise<void>;
    updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth(); // Get the currently logged-in user (operator)
    const [services, setServices] = useState<Service[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [calledTicket, setCalledTicket] = useState<Ticket | null>(null);

    // Function to fetch initial data from the database
    const fetchInitialData = useCallback(async () => {
        // Fetch all services
        const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('*');
        if (servicesError) console.error('Error fetching services:', servicesError);
        else setServices(servicesData as Service[]);

        // Fetch today's tickets
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data: ticketsData, error: ticketsError } = await supabase
            .from('tickets')
            .select('*, service:services(*)') // Joins services table
            .gte('created_at', today.toISOString());
        
        if (ticketsError) console.error('Error fetching tickets:', ticketsError);
        else setTickets(ticketsData as unknown as Ticket[]);

    }, []);

    // Fetch initial data on component mount
    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // --- REAL-TIME SUBSCRIPTION ---
    useEffect(() => {
        const subscription = supabase
            .channel('public:tickets')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tickets' },
                async (payload) => {
                    // When a change occurs, refetch all of today's tickets to ensure consistency.
                    // A more optimized approach would be to handle INSERT, UPDATE, DELETE individually.
                    console.log('Real-time change detected:', payload);
                    await fetchInitialData(); 
                }
            )
            .subscribe();

        // Cleanup subscription on component unmount
        return () => {
            supabase.removeChannel(subscription);
        };
    }, [fetchInitialData]);

    // --- CORE FUNCTIONS ---

    const addTicket = useCallback(async (serviceId: string, userType: UserType, isPriority: boolean): Promise<Ticket | null> => {
        // We will call a Postgres function to securely generate the ticket number
        // This function needs to be created in your SQL migration
        const { data, error } = await supabase.rpc('create_ticket', {
            p_service_id: serviceId,
            p_user_type: userType,
            p_is_priority: isPriority,
        });

        if (error) {
            console.error('Error creating ticket:', error);
            return null;
        }

        // The real-time subscription will automatically update the state for all clients.
        // But we can return the newly created ticket for immediate feedback to the user.
        return data as Ticket;
    }, []);

    const updateTicketStatus = useCallback(async (ticketId: string, status: TicketStatus) => {
        if (!user) {
            console.error('Operator not authenticated to update ticket status');
            return;
        }

        const updatePayload: any = {
            status,
            operator_id: user.id,
        };

        if (status === 'in_progress') {
            updatePayload.started_at = new Date().toISOString();
        } else if (['completed', 'cancelled', 'no_show'].includes(status)) {
            updatePayload.completed_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('tickets')
            .update(updatePayload)
            .eq('id', ticketId);
        
        if (error) {
            console.error(`Error updating ticket to ${status}:`, error);
        }
        // UI will update via real-time subscription
    }, [user]);

    const callNextTicket = useCallback(async (serviceId: string) => {
        // Find the next ticket in 'waiting' state for the given service
        const { data: nextTicket, error } = await supabase
            .from('tickets')
            .select('*, service:services(*)')
            .eq('service_id', serviceId)
            .eq('status', 'waiting')
            .order('is_priority', { ascending: false }) // Priority first
            .order('created_at', { ascending: true }) // Then oldest
            .limit(1)
            .single();
        
        if (error || !nextTicket) {
            console.log('No waiting tickets for this service.', error?.message);
            setCalledTicket(null);
            return;
        }

        // Set for visual effect (e.g., flashing on screen)
        setCalledTicket(nextTicket as unknown as Ticket);
        
        // Automatically update its status to 'in_progress' after a short delay
        setTimeout(() => {
            updateTicketStatus(nextTicket.id, 'in_progress');
            setCalledTicket(null); // Clear the visual effect
        }, 3000); // 3-second delay for the visual call effect

    }, [updateTicketStatus]);

    return (
        <QueueContext.Provider value={{ tickets, services, calledTicket, addTicket, callNextTicket, updateTicketStatus }}>
            {children}
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
