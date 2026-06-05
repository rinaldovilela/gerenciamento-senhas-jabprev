
/**
 * QueueContext (para Painel de Métricas)
 * Contexto para "Painel de Métricas" - Análise histórica
 * 
 * Propósito:
 * - Carrega senhas de PERÍODO (últimos 30 dias por padrão)
 * - Permite filtros avançados para análise
 * - Consulta os campos existentes em tickets
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@lib/supabase/client';
import type { Ticket, Service } from '@shared/types';

interface QueueContextType {
    tickets: Ticket[];
    services: Service[];
    isLoading: boolean;
    fetchTicketsByDateRange: (startDate: Date, endDate: Date) => Promise<Ticket[]>;
    refreshData: () => Promise<void>;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const latestTicketsRequestRef = useRef(0);

    /**
     * Carrega serviços
     */
    const loadServices = useCallback(async () => {
        try {
            const { data: servicesData, error } = await supabase
                .from('services')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            setServices(
                (servicesData || []).map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    description: doc.description,
                    icon: doc.icon,
                    created_at: doc.created_at,
                })) as Service[]
            );
        } catch (error) {
            console.error('[QueueContext] Erro ao carregar serviços:', error);
        }
    }, []);

    /**
     * Carrega senhas por período
     */
    const fetchTicketsByDateRange = useCallback(
        async (startDate: Date, endDate: Date): Promise<Ticket[]> => {
            const requestId = ++latestTicketsRequestRef.current;

            try {
                const startISO = startDate.toISOString();
                const endISO = endDate.toISOString();

                const { data: ticketsData, error } = await supabase
                    .from('tickets')
                    .select(`
                        *,
                        service:service_id(id, name, description, icon, created_at),
                        operator:operator_id(id, name, email)
                    `)
                    .gte('created_at', startISO)
                    .lte('created_at', endISO)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Enriquece com dados de serviço
                const fetchedTickets: Ticket[] = (ticketsData || []).map(doc => {
                    const service = services.find(s => s.id === doc.service_id);
                    return {
                        id: doc.id,
                        number: doc.number,
                        formatted_number: doc.formatted_number,
                        attendee_name: doc.attendee_name || null,
                        service_id: doc.service_id,
                        service: doc.service
                            ? {
                                  id: doc.service.id,
                                  name: doc.service.name,
                                  description: doc.service.description,
                                  icon: doc.service.icon,
                                  created_at: doc.service.created_at,
                              }
                            : service || null,
                        user_type: doc.user_type,
                        status: doc.status,
                        is_priority: doc.is_priority,
                        operator_id: doc.operator_id || null,
                        operator: doc.operator
                            ? {
                                  id: doc.operator.id,
                                  name: doc.operator.name,
                                  email: doc.operator.email,
                              }
                            : null,
                        created_at: doc.created_at,
                        started_at: doc.started_at || null,
                        completed_at: doc.completed_at || null,
                        updated_at: doc.updated_at || null,
                    };
                });

                if (requestId === latestTicketsRequestRef.current) {
                    setTickets(fetchedTickets);
                }
                return fetchedTickets;
            } catch (error) {
                console.error('[QueueContext] Erro ao carregar senhas por período:', error);
                return [];
            }
        },
        []
    );

    /**
     * Carrega dados iniciais (últimos 30 dias)
     */
    const refreshData = useCallback(async () => {
        setIsLoading(true);
        try {
            await loadServices();

            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            thirtyDaysAgo.setHours(0, 0, 0, 0);

            today.setHours(23, 59, 59, 999);

            await fetchTicketsByDateRange(thirtyDaysAgo, today);
        } catch (error) {
            console.error('[QueueContext] Erro ao atualizar dados:', error);
        } finally {
            setIsLoading(false);
        }
    }, [loadServices, fetchTicketsByDateRange]);

    /**
     * Carrega dados na primeira vez
     */
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    return (
        <QueueContext.Provider
            value={{
                tickets,
                services,
                isLoading,
                fetchTicketsByDateRange,
                refreshData,
            }}
        >
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = (): QueueContextType => {
    const context = useContext(QueueContext);
    if (!context) {
        throw new Error('useQueue deve ser usado dentro de QueueProvider');
    }
    return context;
};
