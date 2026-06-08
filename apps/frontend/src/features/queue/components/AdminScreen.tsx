import React, { useMemo } from 'react';
import { useTodayQueue } from '@features/queue/contexts/TodayQueueContext';
import { TRANSLATIONS } from '@shared/constants';
import type { Ticket, Language, Service } from '@shared/types';

import { useAuth } from '@features/auth/contexts/AuthContext';

const language: Language = 'pt'; // Simplified for this component

const OperatorPanel: React.FC = () => {
    const { user } = useAuth();
    const { todayTickets: tickets, callNextTicket, services, updateTicketStatus } = useTodayQueue();

    const myCurrentTicket = useMemo(() => {
        return tickets.find(t => t.status === 'in_progress' && t.operator_id === user?.id);
    }, [tickets, user]);

    const waitingByService = useMemo(() => {
        return tickets.reduce((acc, ticket) => {
            if (!acc[ticket.service.id]) {
                acc[ticket.service.id] = [];
            }
            acc[ticket.service.id].push(ticket);
            return acc;
        }, {} as Record<string, Ticket[]>);
    }, [tickets]);
    
    const visibleServices = useMemo(() => {
        if (user?.role === 'admin') return services;
        const assignedIds = user?.serviceIds || [];
        return services.filter((s) => assignedIds.includes(s.id));
    }, [user, services]);
    
    return (
        <div>
            <section className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-border-color">
                <h2 className="font-montserrat text-2xl font-semibold mb-4 text-jaboatao-blue">{TRANSLATIONS.currentlyServing[language]}</h2>
                {myCurrentTicket ? (
                    <div className="flex flex-col items-center">
                        <div className="text-center mb-4">
                            <p className="text-6xl font-mono font-bold text-text-primary">{myCurrentTicket.formatted_number}</p>
                            <p className="text-lg text-text-secondary">{myCurrentTicket.service.name}</p>
                            {myCurrentTicket.attendee_name && <p className="text-md text-text-secondary mt-1 uppercase font-semibold">{myCurrentTicket.attendee_name}</p>}
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => updateTicketStatus(myCurrentTicket.id, 'completed', 'Atendimento finalizado')}
                                className="px-6 py-2 bg-jaboatao-green-prev text-white font-bold rounded shadow hover:opacity-90"
                            >
                                Finalizar Atendimento
                            </button>
                            <button
                                onClick={() => updateTicketStatus(myCurrentTicket.id, 'no_show', 'Não compareceu')}
                                className="px-6 py-2 bg-red-600 text-white font-bold rounded shadow hover:opacity-90"
                            >
                                Não Compareceu
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-text-secondary">{TRANSLATIONS.noOneServing[language]}</p>
                )}
            </section>
            
            <main>
                <h2 className="font-montserrat text-2xl font-semibold mb-4 text-text-primary">{TRANSLATIONS.waitingQueue[language]}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {visibleServices.map((service: Service) => {
                        const queue = (waitingByService[service.id] || []).sort((a,b) => a.number - b.number);
                        const waitingCount = queue.length;
                        return (
                            <div key={service.id} className="bg-white p-6 rounded-xl shadow-lg flex flex-col border border-border-color">
                                <h3 className="text-xl font-semibold mb-2 text-text-primary">{service.name}</h3>
                                <p className="text-text-secondary mb-4">{waitingCount} {language === 'pt' ? 'aguardando' : 'waiting'}</p>
                                
                                <div className="flex-grow bg-app-bg rounded-lg p-2 min-h-[100px] mb-4 overflow-y-auto">
                                    {queue.length > 0 ? (
                                        <ul className="flex flex-wrap gap-2">
                                            {queue.slice(0, 10).map(t => (
                                                <li key={t.id} className="bg-jaboatao-blue/10 text-jaboatao-blue text-sm font-mono font-bold px-2 py-1 rounded">
                                                    {t.formatted_number}
                                                </li>
                                            ))}
                                            {queue.length > 10 && <li className="text-sm p-1">...</li>}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-text-secondary text-center pt-4">{language === 'pt' ? 'Fila vazia' : 'Empty queue'}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => callNextTicket(service.id)}
                                    disabled={waitingCount === 0}
                                    className="w-full py-3 text-lg font-bold bg-jaboatao-blue text-white rounded-lg shadow-md hover:opacity-90 transition-colors disabled:bg-jaboatao-blue/50 disabled:cursor-not-allowed"
                                >
                                    {TRANSLATIONS.callNext[language]}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    );
};

export default OperatorPanel;