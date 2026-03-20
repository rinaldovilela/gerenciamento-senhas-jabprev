
/**
 * QueueContext (para Painel de Métricas)
 * Contexto para "Painel de Métricas" - Análise histórica
 * 
 * Propósito:
 * - Carrega senhas de PERÍODO (últimos 30 dias por padrão)
 * - Permite filtros avançados para análise
 * - Consulta os campos existentes em tickets
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { databases } from '../appwrite/client';
import { Query } from 'appwrite';
import type { Ticket, Service } from '../types';

const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const APPWRITE_COLLECTION_SERVICES_ID = import.meta.env.VITE_APPWRITE_COLLECTION_SERVICES_ID;
const APPWRITE_COLLECTION_TICKETS_ID = import.meta.env.VITE_APPWRITE_COLLECTION_TICKETS_ID;

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

    /**
     * Carrega serviços
     */
    const loadServices = useCallback(async () => {
        try {
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
        } catch (error) {
            console.error('[QueueContext] Erro ao carregar serviços:', error);
        }
    }, []);

    /**
     * Carrega senhas por período
     */
    const fetchTicketsByDateRange = useCallback(
        async (startDate: Date, endDate: Date): Promise<Ticket[]> => {
            try {
                const response = await databases.listDocuments(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_COLLECTION_TICKETS_ID,
                    [Query.limit(500)]
                );

                // Filtra por data (cliente-side)
                const filteredDocs = response.documents.filter(doc => {
                    const docDate = new Date(doc.$createdAt);
                    return docDate >= startDate && docDate <= endDate;
                });

                // Enriquece com dados de serviço
                const fetchedTickets: Ticket[] = filteredDocs.map(doc => {
                    const service = services.find(s => s.id === doc.service_id);
                    return {
                        id: doc.$id,
                        number: doc.number,
                        formatted_number: doc.formatted_number,
                        service_id: doc.service_id,
                        service: service
                            ? {
                                                                    id: service.id,
                                  name: service.name,
                                  description: service.description,
                                  icon: service.icon,
                                                                    created_at: service.created_at,
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

                setTickets(fetchedTickets);
                return fetchedTickets;
            } catch (error) {
                console.error('[QueueContext] Erro ao carregar senhas por período:', error);
                return [];
            }
        },
        [services]
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
