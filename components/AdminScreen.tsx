import React, { useMemo } from 'react';
import { useQueue } from '../contexts/QueueContext';
import { SERVICES, TRANSLATIONS } from '../constants';
import type { Ticket, Language, Service } from '../types';

const language: Language = 'pt'; // Simplified for this component

const OperatorPanel: React.FC = () => {
    const { tickets, callNextTicket, calledTicket } = useQueue();

    const waitingByService = useMemo(() => {
        return tickets.reduce((acc, ticket) => {
            if (!acc[ticket.service.id]) {
                acc[ticket.service.id] = [];
            }
            acc[ticket.service.id].push(ticket);
            return acc;
        }, {} as Record<string, Ticket[]>);
    }, [tickets]);
    
    return (
        <div>
            <section className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-border-color">
                <h2 className="font-montserrat text-2xl font-semibold mb-4 text-jaboatao-blue">{TRANSLATIONS.currentlyServing[language]}</h2>
                {calledTicket ? (
                    <div className="text-center">
                        <p className="text-6xl font-mono font-bold text-text-primary">{calledTicket.formattedNumber}</p>
                        <p className="text-lg text-text-secondary">{calledTicket.service.name}</p>
                    </div>
                ) : (
                    <p className="text-center text-text-secondary">{TRANSLATIONS.noOneServing[language]}</p>
                )}
            </section>
            
            <main>
                <h2 className="font-montserrat text-2xl font-semibold mb-4 text-text-primary">{TRANSLATIONS.waitingQueue[language]}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {SERVICES.map((service: Service) => {
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
                                                    {t.formattedNumber}
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