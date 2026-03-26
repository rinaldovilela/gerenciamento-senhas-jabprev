// @ts-nocheck
/**
 * TodayQueueContext
 * Contexto para "Acompanhamento de Senhas" (operacional - HOJE APENAS)
 * 
 * Propósito:
 * - Carrega APENAS senhas de hoje
 * - Atualiza em tempo real via WebSocket backend
 * - Foca em operações do atendente (chamar, atualizar status, cancelar)
 * - Consulta os campos existentes em tickets
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import type { Ticket, Service, UserType, TicketStatus } from '../types';
import { useAuth } from './AuthContext';
import { initializeSocket } from '../services/SocketClient';

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

    const isUuid = (value: string): boolean => {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    };

    /**
     * Carrega serviços e senhas de HOJE
     */
    const fetchTodayData = useCallback(async () => {
        console.log('[TodayQueueContext] Iniciando carregamento de dados...');
        setIsLoadingToday(true);
        try {
            // Busca serviços
            const { data: servicesData, error: servicesError } = await supabase
                .from('services')
                .select('*')
                .order('name', { ascending: true });

            if (servicesError) throw servicesError;

            console.log('[TodayQueueContext] Serviços carregados:', servicesData?.length);

            setServices(
                (servicesData || []).map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    description: doc.description,
                    icon: doc.icon,
                    created_at: doc.created_at,
                })) as Service[]
            );

            // Busca APENAS senhas de HOJE
            const today = new Date();
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            const todayStartISO = todayStart.toISOString();
            const todayEndISO = todayEnd.toISOString();

            const { data: ticketsData, error: ticketsError } = await supabase
                .from('tickets')
                .select(`
                    *,
                    service:service_id(id, name, description, icon, created_at)
                `)
                .gte('created_at', todayStartISO)
                .lte('created_at', todayEndISO);

            if (ticketsError) throw ticketsError;

            console.log('[TodayQueueContext] Senhas carregadas:', ticketsData?.length);

            // Enriquece com dados de serviço
            const fetchedTickets: Ticket[] = (ticketsData || []).map(doc => ({
                id: doc.id,
                number: doc.number,
                formatted_number: doc.formatted_number,
                service_id: doc.service_id,
                service: doc.service
                    ? {
                          id: doc.service.id,
                          name: doc.service.name,
                          description: doc.service.description,
                          icon: doc.service.icon,
                          created_at: doc.service.created_at,
                      }
                    : null,
                user_type: doc.user_type,
                status: doc.status,
                is_priority: doc.is_priority,
                operator_id: doc.operator_id || null,
                created_at: doc.created_at,
                started_at: doc.started_at || null,
                completed_at: doc.completed_at || null,
                updated_at: doc.updated_at || null,
            }));

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

    // Subscription WebSocket - USA BACKEND PARA EVENTOS EM TEMPO REAL
    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        console.log('[TodayQueueContext] Inicializando WebSocket:', backendUrl);

        try {
            const socket = initializeSocket(backendUrl);

            // Listener para mudanças em tickets
            socket.on('ticket:change', (event: any) => {
                console.log('[TodayQueueContext] 📨 Mudança de ticket recebida:', {
                    tipo: event.type,
                    ticketId: event.data?.id,
                    status: event.data?.status,
                });

                const isToday = (dateString: string): boolean => {
                    const ticketDate = new Date(dateString);
                    const today = new Date();
                    return ticketDate.toDateString() === today.toDateString();
                };

                // UPDATE: atualizar localmente
                if (event.type === 'UPDATE' && event.data && isToday(event.data.created_at)) {
                    console.log('[TodayQueueContext] ✅ Atualizando ticket localmente:', event.data.id);

                    setTodayTickets(prevTickets =>
                        prevTickets.map(ticket => {
                            if (ticket.id === event.data.id) {
                                return {
                                    ...ticket,
                                    status: event.data.status,
                                    operator_id: event.data.operator_id || ticket.operator_id,
                                    started_at: event.data.started_at || ticket.started_at,
                                    completed_at: event.data.completed_at || ticket.completed_at,
                                    updated_at: event.data.updated_at,
                                };
                            }
                            return ticket;
                        })
                    );
                } else if ((event.type === 'INSERT' || event.type === 'DELETE') && event.data?.created_at && isToday(event.data.created_at)) {
                    console.log('[TodayQueueContext] 🔄 Refetch necessário para', event.type);
                    fetchTodayData();
                }
            });

            return () => {
                socket.off('ticket:change');
                console.log('[TodayQueueContext] Desconectado de ticket:change');
            };
        } catch (error) {
            console.error('[TodayQueueContext] Erro ao configurar WebSocket:', error);
            // Fallback: tentar usar Supabase real-time se WebSocket falhar
            return undefined;
        }
    }, [fetchTodayData]);

    /**
     * Adiciona nova senha
     */
    const addTicket = useCallback(
        async (serviceId: string, userType: UserType, isPriority: boolean): Promise<Ticket | null> => {
            try {
                // Usar a função RPC do Supabase para criar a senha
                const { data: newTicketDocument, error } = await supabase.rpc('create_ticket', {
                    p_service_id: serviceId,
                    p_user_type: userType,
                    p_is_priority: isPriority,
                });

                if (error) throw error;

                const service = services.find(s => s.id === serviceId);
                const newTicket: Ticket = {
                    id: newTicketDocument.id,
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
                    created_at: newTicketDocument.created_at,
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
            try {
                console.log('[TodayQueueContext] Atualizando status da senha:', ticketId, 'para', status);
                
                const updatePayload: any = {
                    status,
                };

                if (status === 'in_progress') {
                    updatePayload.started_at = new Date().toISOString();
                } else if (['completed', 'cancelled', 'no_show'].includes(status)) {
                    updatePayload.completed_at = new Date().toISOString();
                }

                if (user && isUuid(user.id)) {
                    updatePayload.operator_id = user.id;
                }

                console.log('[TodayQueueContext] Payload:', updatePayload);

                const { data: updatedRow, error } = await supabase
                    .from('tickets')
                    .update(updatePayload)
                    .eq('id', ticketId)
                    .select('*')
                    .maybeSingle();

                if (error) throw error;

                if (!updatedRow) {
                    throw new Error('Nenhuma linha foi atualizada. Verifique políticas RLS/permissões.');
                }

                setTodayTickets(prevTickets =>
                    prevTickets.map(ticket =>
                        ticket.id === ticketId
                            ? {
                                  ...ticket,
                                  status: updatedRow.status,
                                  operator_id: updatedRow.operator_id || ticket.operator_id,
                                  started_at: updatedRow.started_at || ticket.started_at,
                                  completed_at: updatedRow.completed_at || ticket.completed_at,
                                  updated_at: updatedRow.updated_at || ticket.updated_at,
                              }
                            : ticket
                    )
                );
                
                console.log('[TodayQueueContext] Status atualizado com sucesso');
            } catch (error) {
                console.error('[TodayQueueContext] Erro ao atualizar status:', error);
                throw error;
            }
        },
        [user]
    );

    /**
     * Chama próxima senha
     */
    const callNextTicket = useCallback(
        async (serviceId: string) => {
            try {
                // Busca próxima senha aguardando (prioriza prioritários)
                const { data: nextTickets, error } = await supabase
                    .from('tickets')
                    .select(`
                        *,
                        service:service_id(id, name, description, icon, created_at)
                    `)
                    .eq('service_id', serviceId)
                    .eq('status', 'waiting')
                    .order('is_priority', { ascending: false })
                    .order('created_at', { ascending: true })
                    .limit(1);

                if (error) throw error;

                const nextTicketDocument = nextTickets?.[0];

                if (nextTicketDocument) {
                    const service = services.find(s => s.id === nextTicketDocument.service_id);
                    const ticketForDisplay: Ticket = {
                        id: nextTicketDocument.id,
                        number: nextTicketDocument.number,
                        formatted_number: nextTicketDocument.formatted_number,
                        service_id: nextTicketDocument.service_id,
                        service: nextTicketDocument.service
                            ? {
                                  id: nextTicketDocument.service.id,
                                  name: nextTicketDocument.service.name,
                                  description: nextTicketDocument.service.description,
                                  icon: nextTicketDocument.service.icon,
                                  created_at: nextTicketDocument.service.created_at,
                              }
                            : service || null,
                        user_type: nextTicketDocument.user_type,
                        status: nextTicketDocument.status,
                        is_priority: nextTicketDocument.is_priority,
                        operator_id: nextTicketDocument.operator_id || null,
                        created_at: nextTicketDocument.created_at,
                        started_at: nextTicketDocument.started_at || null,
                        completed_at: nextTicketDocument.completed_at || null,
                    };

                    setCalledTicket(ticketForDisplay);

                    // Muda status para in_progress após 3s
                    setTimeout(() => {
                        updateTicketStatus(nextTicketDocument.id, 'in_progress', 'Chamada pelo operador');
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
