
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueue } from '../contexts/QueueContext';
import type { Ticket, Language } from '../types';
import { TRANSLATIONS } from '../constants';

const RETURN_TIMEOUT_SECONDS = 15;

interface TicketScreenProps {
    ticket: Ticket;
    onNewTicket: () => void;
    onExit?: () => void;
    fullscreenMode?: boolean;
}

const TicketScreen: React.FC<TicketScreenProps> = ({ ticket, onNewTicket, onExit, fullscreenMode }) => {
    const { tickets, calledTicket } = useQueue();
    const [language] = useState<Language>('pt');
    const [countdown, setCountdown] = useState(RETURN_TIMEOUT_SECONDS);

    const isMyTicketCalled = calledTicket?.id === ticket.id;

    const peopleAhead = useMemo(() => {
        const myCreatedAt = new Date(ticket.created_at).getTime();
        return tickets.filter(t => 
            t.service_id === ticket.service_id && 
            t.status === 'waiting' &&
            new Date(t.created_at).getTime() < myCreatedAt
        ).length;
    }, [tickets, ticket]);

    const estimatedWaitTime = useMemo(() => {
        // Simple estimation: 3 minutes per person
        return peopleAhead * 3;
    }, [peopleAhead]);

    const assignedCounter = useMemo(() => {
        // Simple logic to assign a counter
        if(ticket.is_priority) return '1 (Prioritário)';
        return 'Geral';
    }, [ticket.is_priority]);

    const successMessage = useMemo(() => {
        if (ticket.is_priority) {
            return `Senha prioritária ${ticket.formatted_number} gerada com sucesso!`;
        }
        return TRANSLATIONS.ticketGeneratedSuccess[language];
    }, [ticket, language]);

    useEffect(() => {
        if (isMyTicketCalled) {
            // Vibrate if the API is available
            if (navigator.vibrate) {
                navigator.vibrate([500, 100, 500]);
            }
        }
    }, [isMyTicketCalled]);

    useEffect(() => {
        if (isMyTicketCalled) return;

        if (countdown <= 0) {
            onNewTicket();
            return;
        }

        const timerId = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [countdown, onNewTicket, isMyTicketCalled]);

    const handleReprint = () => {
        // In a real app, this would trigger a print action
        alert(`Imprimindo senha: ${ticket.formatted_number}`);
    };

    const handleReturnNow = useCallback(() => {
        onNewTicket();
    }, [onNewTicket]);

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen p-3 sm:p-4 lg:p-8 transition-colors duration-500 ${isMyTicketCalled ? 'bg-jaboatao-green-prev' : 'bg-jaboatao-blue'}`}>
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 text-center relative overflow-hidden">
                {isMyTicketCalled && (
                    <div className="absolute inset-0 bg-jaboatao-green-prev text-white flex items-center justify-center z-20 animate-pulse">
                         <div className="text-center">
                            <h2 className="text-5xl font-extrabold">{TRANSLATIONS.ticketCalled[language]}</h2>
                             <p className="text-3xl mt-4">{`${TRANSLATIONS.goToCounter[language]} ${assignedCounter}`}</p>
                        </div>
                    </div>
                )}
                
                <div className="relative z-10">
                    <h2 className="text-2xl font-semibold text-text-secondary">{TRANSLATIONS.yourTicket[language]}</h2>
                    <p className="text-jaboatao-green-prev text-lg mb-2 animate-fade-in-up">{successMessage}</p>
                    <p className="my-2 text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-mono font-extrabold text-text-primary tracking-tighter leading-none">
                        {ticket.formatted_number}
                    </p>
                    <div className="border border-border-color p-4 rounded-xl mb-6">
                        <p className="text-xl font-semibold text-text-primary">{ticket.service.name}</p>
                        <p className="text-md text-text-secondary">{ticket.service.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-left mb-6 sm:mb-8">
                        <div className="border border-border-color p-3 sm:p-4 rounded-xl flex flex-col justify-center">
                            <p className="text-xs sm:text-sm font-semibold text-text-secondary">{TRANSLATIONS.goToCounter[language]}</p>
                            <p className="text-2xl sm:text-3xl font-semibold text-text-primary">{assignedCounter}</p>
                        </div>
                        <div className="border border-border-color p-3 sm:p-4 rounded-xl flex flex-col justify-center">
                            <p className="text-xs sm:text-sm font-semibold text-text-secondary">{TRANSLATIONS.waitTime[language]}</p>
                            <p className="text-2xl sm:text-3xl font-semibold text-text-primary">~{estimatedWaitTime} <span className="text-base sm:text-lg font-medium">{TRANSLATIONS.minutes[language]}</span></p>
                            <p className="text-xs text-text-secondary">{peopleAhead} {TRANSLATIONS.peopleAhead[language]}</p>
                        </div>
                        <div className="border border-border-color p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center sm:col-span-2 lg:col-span-1">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`https://jaboataoprev.gov.br/atendimento/status?id=${ticket.id}`)}`} 
                                alt="QR Code para acompanhar o status da senha"
                                className="rounded-md w-20 h-20 sm:w-24 sm:h-24"
                            />
                            <p className="text-xs text-text-secondary mt-2 text-center">Acompanhe sua vez</p>
                        </div>
                    </div>

                    <div className="mt-8 border-t-2 border-border-color pt-6">
                        <div className="text-center mb-4">
                            <p className="text-text-secondary text-sm">
                                {TRANSLATIONS.autoReturnMessage[language].replace('{countdown}', String(countdown))}
                            </p>
                            <div className="w-full bg-border-color rounded-full h-2.5 mt-2 overflow-hidden">
                                <div 
                                    className="bg-jaboatao-blue h-2.5 rounded-full" 
                                    style={{ 
                                        width: `${(countdown / RETURN_TIMEOUT_SECONDS) * 100}%`, 
                                        transition: countdown === RETURN_TIMEOUT_SECONDS ? 'none' : 'width 1s linear'
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button onClick={handleReprint} className="flex-1 py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg font-bold bg-white text-jaboatao-green-prev border border-jaboatao-green-prev rounded-xl hover:bg-jaboatao-green-prev/5 transition-colors">
                                {TRANSLATIONS.reprintTicket[language]}
                            </button>
                            <button onClick={handleReturnNow} className="flex-1 py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg font-bold bg-jaboatao-blue text-white rounded-xl hover:opacity-90 transition-colors shadow-md">
                                {TRANSLATIONS.returnNow[language]}
                            </button>
                            {onExit && (
                                <button 
                                    onClick={onExit} 
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg font-bold bg-white text-text-secondary border border-text-secondary rounded-xl hover:bg-text-secondary/5 transition-colors items-center justify-center gap-2 ${
                                        fullscreenMode ? 'hidden landscape:hidden portrait:flex' : 'hidden lg:flex'
                                    }`}
                                    title="Sair Fullscreen"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                                    Sair Fullscreen
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketScreen;
