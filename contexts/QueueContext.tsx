
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { databases, client } from '../appwrite/client';
import { Query, ID } from 'appwrite';
import type { Ticket, Service, UserType, TicketStatus } from '../types';
import { useAuth } from './AuthContext'; // Assuming you have an AuthContext to get the operator

const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const APPWRITE_COLLECTION_SERVICES_ID = import.meta.env.VITE_APPWRITE_COLLECTION_SERVICES_ID;
const APPWRITE_COLLECTION_TICKETS_ID = import.meta.env.VITE_APPWRITE_COLLECTION_TICKETS_ID;

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

    const fetchInitialData = useCallback(async () => {
        if (!APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_SERVICES_ID || !APPWRITE_COLLECTION_TICKETS_ID) {
            console.error("Appwrite IDs are not configured. Check your .env.local file.");
            return;
        }

        try {
            // Fetch all services
            const servicesResponse = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_SERVICES_ID,
                [Query.orderAsc('name')]
            );
            // Map Appwrite documents to your Service interface
            setServices(servicesResponse.documents.map(doc => ({
                id: doc.$id,
                name: doc.name,
                description: doc.description,
                icon: doc.icon,
                created_at: doc.$createdAt
            })) as Service[]);

            // Fetch today's tickets
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const ticketsResponse = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_TICKETS_ID,
                [
                    Query.greaterThanEqual('created_at', today.toISOString()),
                    Query.orderAsc('created_at'),
                    Query.limit(100) // Limit to a reasonable number
                ]
            );

            // Map Appwrite documents to your Ticket interface and enrich with service data
            const fetchedTickets: Ticket[] = await Promise.all(ticketsResponse.documents.map(async doc => {
                const service = servicesResponse.documents.find(s => s.$id === doc.service_id);
                return {
                    id: doc.$id,
                    number: doc.number,
                    formatted_number: doc.formatted_number,
                    service_id: doc.service_id,
                    // @ts-ignore - Temporary ignore as service might be undefined if not found
                    service: service ? { id: service.$id, name: service.name, description: service.description, icon: service.icon } : null,
                    user_type: doc.user_type,
                    status: doc.status,
                    is_priority: doc.is_priority,
                    operator_id: doc.operator_id || null,
                    created_at: doc.$createdAt,
                    started_at: doc.started_at || null,
                    completed_at: doc.completed_at || null,
                };
            }));
            setTickets(fetchedTickets);

        } catch (error) {
            console.error('Error fetching initial data from Appwrite:', error);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // --- REAL-TIME SUBSCRIPTION ---
    useEffect(() => {
        if (!APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_TICKETS_ID) {
            console.error("Appwrite IDs are not configured for real-time. Check your .env.local file.");
            return;
        }

        const unsubscribe = client.subscribe(
            `databases.${APPWRITE_DATABASE_ID}.collections.${APPWRITE_COLLECTION_TICKETS_ID}.documents`,
            response => {
                // For any change (create, update, delete), refetch all data for consistency
                // A more optimized approach would handle each event type individually
                console.log('Appwrite Real-time change detected:', response);
                fetchInitialData();
            }
        );

        return () => {
            unsubscribe();
        };
    }, [fetchInitialData]);

    // --- CORE FUNCTIONS ---

    const addTicket = useCallback(async (serviceId: string, userType: UserType, isPriority: boolean): Promise<Ticket | null> => {
        if (!APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_TICKETS_ID) {
            console.error("Appwrite IDs are not configured for adding tickets. Check your .env.local file.");
            return null;
        }

        try {
            // Determine prefix
            let prefix = isPriority ? 'PRIO' : (
                userType === 'aposentado' ? 'APO' :
                userType === 'pensionista' ? 'PEN' :
                'ATV'
            );

            // Fetch last ticket number for today with the same prefix
            const lastTicketResponse = await databases.listDocuments(
                APPWRITE_DATABASE_DATABASE_ID,
                APPWRITE_COLLECTION_TICKETS_ID,
                [
                    Query.startsWith('formatted_number', prefix + '-'),
                    Query.greaterThanEqual('created_at', new Date().toISOString().split('T')[0]), // Today's tickets
                    Query.orderDesc('number'),
                    Query.limit(1)
                ]
            );

            const lastNumber = lastTicketResponse.documents.length > 0 ? (lastTicketResponse.documents[0].number || 0) : 0;
            const nextNumber = lastNumber + 1;
            const formattedNumber = `${prefix}-${String(nextNumber).padStart(3, '0')}`;

            const newTicketDocument = await databases.createDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_TICKETS_ID,
                ID.unique(), // Let Appwrite generate a unique ID
                {
                    number: nextNumber,
                    formatted_number: formattedNumber,
                    service_id: serviceId,
                    user_type: userType,
                    status: 'waiting',
                    is_priority: isPriority,
                }
            );

            // Enrich with service data before returning
            const service = services.find(s => s.id === serviceId);
            const newTicket: Ticket = {
                id: newTicketDocument.$id,
                number: newTicketDocument.number,
                formatted_number: newTicketDocument.formatted_number,
                service_id: newTicketDocument.service_id,
                // @ts-ignore
                service: service ? { id: service.id, name: service.name, description: service.description, icon: service.icon } : null,
                user_type: newTicketDocument.user_type,
                status: newTicketDocument.status,
                is_priority: newTicketDocument.is_priority,
                operator_id: newTicketDocument.operator_id || null,
                created_at: newTicketDocument.$createdAt,
                started_at: newTicketDocument.started_at || null,
                completed_at: newTicketDocument.completed_at || null,
            };
            
            return newTicket;

        } catch (error) {
            console.error('Error creating ticket in Appwrite:', error);
            return null;
        }
    }, [services]);

    const updateTicketStatus = useCallback(async (ticketId: string, status: TicketStatus) => {
        if (!APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_TICKETS_ID) {
            console.error("Appwrite IDs are not configured for updating tickets. Check your .env.local file.");
            return;
        }
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

        try {
            await databases.updateDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_TICKETS_ID,
                ticketId,
                updatePayload
            );
        } catch (error) {
            console.error(`Error updating ticket ${ticketId} status to ${status} in Appwrite:`, error);
        }
        // UI will update via real-time subscription
    }, [user]);

    const callNextTicket = useCallback(async (serviceId: string) => {
        if (!APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_TICKETS_ID) {
            console.error("Appwrite IDs are not configured for calling next ticket. Check your .env.local file.");
            return;
        }

        try {
            const nextTicketResponse = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_TICKETS_ID,
                [
                    Query.equal('service_id', serviceId),
                    Query.equal('status', 'waiting'),
                    Query.orderDesc('is_priority'), // Priority first
                    Query.orderAsc('created_at'), // Then oldest
                    Query.limit(1)
                ]
            );
            
            const nextTicketDocument = nextTicketResponse.documents[0];

            if (nextTicketDocument) {
                // Enrich with service data for visual effect
                const service = services.find(s => s.id === nextTicketDocument.service_id);
                const ticketForDisplay: Ticket = {
                    id: nextTicketDocument.$id,
                    number: nextTicketDocument.number,
                    formatted_number: nextTicketDocument.formatted_number,
                    service_id: nextTicketDocument.service_id,
                    // @ts-ignore
                    service: service ? { id: service.id, name: service.name, description: service.description, icon: service.icon } : null,
                    user_type: nextTicketDocument.user_type,
                    status: nextTicketDocument.status,
                    is_priority: nextTicketDocument.is_priority,
                    operator_id: nextTicketDocument.operator_id || null,
                    created_at: nextTicketDocument.$createdAt,
                    started_at: nextTicketDocument.started_at || null,
                    completed_at: nextTicketDocument.completed_at || null,
                };

                setCalledTicket(ticketForDisplay);
                
                // Automatically update its status to 'in_progress' after a short delay
                setTimeout(() => {
                    updateTicketStatus(nextTicketDocument.$id, 'in_progress');
                    setCalledTicket(null); // Clear the visual effect
                }, 3000); // 3-second delay for the visual call effect
            } else {
                console.log('No waiting tickets for this service.');
                setCalledTicket(null);
            }
        } catch (error) {
            console.error('Error calling next ticket from Appwrite:', error);
        }
    }, [updateTicketStatus, services]);

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
