/**
 * TodayQueueContext
 * Contexto para "Acompanhamento de Senhas" (operacional - HOJE APENAS)
 * 
 * Propósito:
 * - Carrega APENAS senhas de hoje
 * - Atualiza em tempo real
 * - Foca em operações do atendente (chamar, atualizar status, cancelar)
 * - Consulta os campos existentes em tickets
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { databases, client } from '../appwrite/client';
import { Query, ID } from 'appwrite';
import type { Ticket, Service, UserType, TicketStatus } from '../types';
import { useAuth } from './AuthContext';

const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const APPWRITE_COLLECTION_SERVICES_ID = import.meta.env.VITE_APPWRITE_COLLECTION_SERVICES_ID;
const APPWRITE_COLLECTION_TICKETS_ID = import.meta.env.VITE_APPWRITE_COLLECTION_TICKETS_ID;

interface TodayQueueContextType {
    // Estado
    todayTickets: Ticket[];
    services: Service[];
    calledTicket: Ticket | null;
    isLoadingToday: boolean;
    
    // Funções operacionais
    addTicket: (serviceId: string, userType: UserType, isPriority: boolean) => Promise<Ticket | null>;
    callNextTicket: (serviceId: string) => Promise<void>;
    updateTicketStatus: (ticketId: string, status: TicketStatus, reason?: string) => Promise<void>;
    
    // Métodos auxiliares
    refreshTodayTickets: () => Promise<void>;
    getTodayTicketCount: () => number;
}

const TodayQueueContext = createContext<TodayQueueContextType | undefined>(undefined);

export const TodayQueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [todayTickets, setTodayTickets] = useState<Ticket[]>([]);
    const [calledTicket, setCalledTicket] = useState<Ticket | null>(null);
    const [isLoadingToday, setIsLoadingToday] = useState(true);

    /**
     * Carrega serviços e senhas de HOJE
     */
    const fetchTodayData = useCallback(async () => {
        setIsLoadingToday(true);
        try {
            // Busca serviços
            const servicesResponse = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_SERVICES_ID,
                [Query.orderAsc('name')]
            );

            setServices(
                servicesResponse.documents.map(doc => ({
                    id: doc.$id,
                    name: doc.name,
                    description: doc.description,
                    icon: doc.icon,
                    created_at: doc.$createdAt,
                })) as Service[]
            );

            // Busca APENAS senhas de HOJE
            const today = new Date();
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            const allTicketsResponse = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_TICKETS_ID,
                [Query.limit(1000)]
            );

            // Filtra apenas de hoje (cliente-side)
            const todayTicketsList = allTicketsResponse.documents.filter(doc => {
                const docDate = new Date(doc.$createdAt);
                return docDate >= todayStart && docDate <= todayEnd;
            });

            // Enriquece com dados de serviço
            const fetchedTickets: Ticket[] = todayTicketsList.map(doc => {
                const service = servicesResponse.documents.find(s => s.$id === doc.service_id);
                return {
                    id: doc.$id,
                    number: doc.number,
                    formatted_number: doc.formatted_number,
                    service_id: doc.service_id,
                    service: service
                        ? {
                              id: service.$id,
                              name: service.name,
                              description: service.description,
                              icon: service.icon,
                              created_at: service.$createdAt,
                          }
                        : null,
                    user_type: doc.user_type,
                    status: doc.status,
                    is_priority: doc.is_priority,
                    operator_id: doc.operator_id || null,
                    created_at: doc.$createdAt,
                    started_at: doc.started_at || null,
                    completed_at: doc.completed_at || null,
                    updated_at: doc.$updatedAt || null,
                };
            });

            setTodayTickets(fetchedTickets);
        } catch (error) {
            console.error('[TodayQueueContext] Erro ao carregar dados de hoje:', error);
        } finally {
            setIsLoadingToday(false);
        }
    }, []);

    // Carrega dados na primeira vez
    useEffect(() => {
        fetchTodayData();
    }, [fetchTodayData]);

    // Subscription real-time
    useEffect(() => {
        if (!APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_TICKETS_ID) {
            console.error('[TodayQueueContext] IDs não configurados');
            return;
        }

        const unsubscribe = client.subscribe(
            `databases.${APPWRITE_DATABASE_ID}.collections.${APPWRITE_COLLECTION_TICKETS_ID}.documents`,
            () => {
                console.log('[TodayQueueContext] Mudança detectada, atualizando...');
                fetchTodayData();
            }
        );

        return () => {
            unsubscribe();
        };
    }, [fetchTodayData]);

    /**
     * Adiciona nova senha
     */
    const addTicket = useCallback(
        async (serviceId: string, userType: UserType, isPriority: boolean): Promise<Ticket | null> => {
            if (!APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_TICKETS_ID) {
                console.error('[TodayQueueContext] IDs não configurados');
                return null;
            }

            try {
                let prefix = isPriority ? 'PRIO' : userType === 'aposentado' ? 'APO' : userType === 'pensionista' ? 'PEN' : 'ATV';

                // Busca último número do dia
                const lastResponse = await databases.listDocuments(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_COLLECTION_TICKETS_ID,
                    [Query.startsWith('formatted_number', prefix + '-'), Query.orderDesc('number'), Query.limit(100)]
                );

                // Filtra de hoje
                const today = new Date();
                const todayStart = new Date(today);
                todayStart.setHours(0, 0, 0, 0);

                const todayTickets = lastResponse.documents.filter(doc => {
                    const docDate = new Date(doc.$createdAt);
                    return docDate >= todayStart;
                });

                const lastNumber = todayTickets.length > 0 ? (todayTickets[0].number || 0) : 0;
                const nextNumber = lastNumber + 1;
                const formattedNumber = `${prefix}-${String(nextNumber).padStart(3, '0')}`;

                const newTicketDocument = await databases.createDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_COLLECTION_TICKETS_ID,
                    ID.unique(),
                    {
                        number: nextNumber,
                        formatted_number: formattedNumber,
                        service_id: serviceId,
                        user_type: userType,
                        status: 'waiting',
                        is_priority: isPriority,
                    }
                );

                const service = services.find(s => s.id === serviceId);
                const newTicket: Ticket = {
                    id: newTicketDocument.$id,
                    number: newTicketDocument.number,
                    formatted_number: newTicketDocument.formatted_number,
                    service_id: newTicketDocument.service_id,
                    service: service
                        ? {
                              id: service.id,
                              name: service.name,
                              description: service.description,
                              icon: service.icon,
                              created_at: service.created_at,
                          }
                        : null,
                    user_type: newTicketDocument.user_type,
                    status: newTicketDocument.status,
                    is_priority: newTicketDocument.is_priority,
                    operator_id: null,
                    created_at: newTicketDocument.$createdAt,
                    started_at: null,
                    completed_at: null,
                };

                return newTicket;
            } catch (error) {
                console.error('[TodayQueueContext] Erro ao criar senha:', error);
                return null;
            }
        },
        [services]
    );

    /**
     * Atualiza status da senha
     */
    const updateTicketStatus = useCallback(
        async (ticketId: string, status: TicketStatus, reason?: string) => {
            if (!APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_TICKETS_ID) {
                console.error('[TodayQueueContext] IDs não configurados');
                return;
            }

            try {
                const updatePayload: any = {
                    status,
                };

                if (status === 'in_progress') {
                    updatePayload.started_at = new Date().toISOString();
                } else if (['completed', 'cancelled', 'no_show'].includes(status)) {
                    updatePayload.completed_at = new Date().toISOString();
                }

                if (user) {
                    updatePayload.operator_id = user.id;
                }

                await databases.updateDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_COLLECTION_TICKETS_ID,
                    ticketId,
                    updatePayload
                );
            } catch (error) {
                console.error('[TodayQueueContext] Erro ao atualizar status:', error);
            }
        },
        [user]
    );

    /**
     * Chama próxima senha
     */
    const callNextTicket = useCallback(
        async (serviceId: string) => {
            if (!APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_TICKETS_ID) {
                console.error('[TodayQueueContext] IDs não configurados');
                return;
            }

            try {
                const nextTicketResponse = await databases.listDocuments(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_COLLECTION_TICKETS_ID,
                    [
                        Query.equal('service_id', serviceId),
                        Query.equal('status', 'waiting'),
                        Query.orderDesc('is_priority'),
                        Query.orderAsc('created_at'),
                        Query.limit(1),
                    ]
                );

                const nextTicketDocument = nextTicketResponse.documents[0];

                if (nextTicketDocument) {
                    const service = services.find(s => s.id === nextTicketDocument.service_id);
                    const ticketForDisplay: Ticket = {
                        id: nextTicketDocument.$id,
                        number: nextTicketDocument.number,
                        formatted_number: nextTicketDocument.formatted_number,
                        service_id: nextTicketDocument.service_id,
                        service: service
                            ? {
                                  id: service.id,
                                  name: service.name,
                                  description: service.description,
                                  icon: service.icon,
                                  created_at: service.created_at,
                              }
                            : null,
                        user_type: nextTicketDocument.user_type,
                        status: nextTicketDocument.status,
                        is_priority: nextTicketDocument.is_priority,
                        operator_id: nextTicketDocument.operator_id || null,
                        created_at: nextTicketDocument.$createdAt,
                        started_at: nextTicketDocument.started_at || null,
                        completed_at: nextTicketDocument.completed_at || null,
                    };

                    setCalledTicket(ticketForDisplay);

                    // Muda status para in_progress após 3s
                    setTimeout(() => {
                        updateTicketStatus(nextTicketDocument.$id, 'in_progress', 'Chamada pelo operador');
                        setCalledTicket(null);
                    }, 3000);
                } else {
                    console.log('[TodayQueueContext] Nenhuma senha aguardando');
                    setCalledTicket(null);
                }
            } catch (error) {
                console.error('[TodayQueueContext] Erro ao chamar próxima senha:', error);
            }
        },
        [updateTicketStatus, services, user]
    );

    return (
        <TodayQueueContext.Provider
            value={{
                todayTickets,
                services,
                calledTicket,
                isLoadingToday,
                addTicket,
                callNextTicket,
                updateTicketStatus,
                refreshTodayTickets: fetchTodayData,
                getTodayTicketCount: () => todayTickets.length,
            }}
        >
            {children}
        </TodayQueueContext.Provider>
    );
};

export const useTodayQueue = (): TodayQueueContextType => {
    const context = useContext(TodayQueueContext);
    if (!context) {
        throw new Error('useTodayQueue deve ser usado dentro de TodayQueueProvider');
    }
    return context;
};
