
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTodayQueue } from '../contexts/TodayQueueContext';
import { PANEL_CONFIG } from '../constants';
import type { Ticket, UserType } from '../types';

const JaboataoPrevLogo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center space-x-4 ${className}`}>
        <div className="p-2 bg-panel-primary rounded-md shadow-md">
             <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>
        </div>
        <div>
            <h1 className="font-poppins text-4xl font-bold text-panel-primary">JABOATÃOPREV</h1>
        </div>
    </div>
);

const UserTypeIcon: React.FC<{ userType: UserType }> = ({ userType }) => {
    switch (userType) {
        case 'aposentado': return <span title="Aposentado">👴</span>;
        case 'pensionista': return <span title="Pensionista">👵</span>;
        case 'servidor_ativo': return <span title="Servidor Ativo">👨‍💼</span>;
        default: return null;
    }
};

// Base64 encoded WAV file for a simple "ding" sound
const notificationSound = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"+Array(30).join("9vT19");

const getGuicheForTicket = (ticket: Ticket): string => {
    if (ticket.is_priority) return 'Guichê 1 (Prioritário)';
    return 'Geral';
};

interface PublicDisplayScreenProps {
    onBack: () => void;
}

const PublicDisplayScreen: React.FC<PublicDisplayScreenProps> = ({ onBack }) => {
    const { todayTickets: tickets } = useTodayQueue();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [lastCalledTicketId, setLastCalledTicketId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const previousInProgressIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (PANEL_CONFIG.mostrarSons) {
            audioRef.current = new Audio(notificationSound);
        }
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, PANEL_CONFIG.atualizacaoAutomatica);
        return () => clearInterval(timer);
    }, []);

    const inProgressTickets = useMemo(() => {
        return tickets
            .filter(t => t.status === 'in_progress' && t.started_at)
            .sort((a, b) => new Date(b.started_at!).getTime() - new Date(a.started_at!).getTime())
            .slice(0, PANEL_CONFIG.mostrarEmAtendimento);
    }, [tickets]);
    
    const waitingTickets = useMemo(() => {
        return tickets
            .filter(t => t.status === 'waiting')
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .slice(0, PANEL_CONFIG.mostrarProximas);
    }, [tickets]);

    useEffect(() => {
        const currentInProgressIds = new Set(inProgressTickets.map(t => t.id));
        
        // Find newly added tickets to "in_progress"
        const newCalls = [...currentInProgressIds].filter(id => !previousInProgressIds.current.has(id));

        if (newCalls.length > 0) {
            const latestCallId = newCalls[0];
            setLastCalledTicketId(latestCallId);
            
            if (PANEL_CONFIG.mostrarSons && audioRef.current) {
                audioRef.current.play().catch(e => console.error("Error playing sound:", e));
            }

            setTimeout(() => {
                setLastCalledTicketId(null);
            }, 5000); 
        }

        previousInProgressIds.current = currentInProgressIds;
    }, [inProgressTickets]);

    return (
        <div className="flex flex-col w-full min-h-screen p-3 sm:p-4 md:p-6 bg-panel-bg font-poppins text-panel-secondary">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack} 
                        className="p-2 sm:p-3 rounded-full bg-white/80 hover:bg-white transition-colors border border-border-color shadow-sm" 
                        aria-label="Voltar para a tela inicial"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-panel-primary"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                    </button>
                    <JaboataoPrevLogo />
                </div>
                <div className="text-right text-sm sm:text-base">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-panel-primary">{currentTime.toLocaleTimeString('pt-BR')}</p>
                    <p className="text-xs sm:text-sm md:text-base text-panel-secondary">{currentTime.toLocaleDateString('pt-BR', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                </div>
            </header>

            <main className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <section className="md:col-span-2 bg-white/70 p-4 md:p-6 rounded-2xl shadow-lg">
                    <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-panel-primary mb-3 md:mb-4 border-b-4 border-panel-primary pb-2">SENHAS EM ATENDIMENTO</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 min-h-[150px] md:min-h-[unset]">
                        {inProgressTickets.length > 0 ? inProgressTickets.map(ticket => {
                             const isNewlyCalled = ticket.id === lastCalledTicketId;
                             return (
                                <div key={ticket.id} className={`flex flex-col justify-center items-center p-4 rounded-xl transition-all duration-300 ${isNewlyCalled ? 'bg-jaboatao-green-prev/80 text-white shadow-2xl scale-105 animate-pulse' : 'bg-white shadow-md'}`}>
                                    <p className={`font-bold text-lg md:text-2xl ${isNewlyCalled ? 'text-white' : 'text-panel-secondary'}`}>{getGuicheForTicket(ticket)}</p>
                                    <p className={`font-bold text-5xl sm:text-6xl md:text-8xl my-2 tracking-tighter ${isNewlyCalled ? 'text-white' : 'text-panel-primary'}`}>{ticket.formatted_number}</p>
                                    <div className={`flex items-center text-sm md:text-xl font-semibold border-4 rounded-lg px-3 md:px-4 py-2 border-blue-600/40 ${isNewlyCalled ? 'text-white border-transparent' : 'text-blue-600'}`}>
                                        <div className="w-3 h-3 bg-blue-600 rounded-full mr-2 animate-ping"></div>
                                        Em Atendimento
                                    </div>
                                </div>
                            )
                        }) : <p className="col-span-full text-base md:text-2xl text-center self-center text-text-secondary">Nenhuma senha em atendimento no momento.</p>}
                    </div>
                </section>

                <aside className="md:col-span-1 bg-white/70 p-4 md:p-6 rounded-2xl shadow-lg flex flex-col">
                    <h2 className="font-poppins text-2xl sm:text-3xl md:text-3xl font-bold text-panel-primary mb-3 md:mb-4 border-b-4 border-panel-primary pb-2">PRÓXIMAS SENHAS</h2>
                    <ul className="space-y-3 flex-grow overflow-y-auto">
                        {waitingTickets.length > 0 ? waitingTickets.map(ticket => (
                            <li key={ticket.id} className="flex items-center justify-between bg-white p-3 md:p-4 rounded-lg shadow-sm text-base md:text-2xl">
                                <span className="font-bold text-panel-primary">{ticket.formatted_number}</span>
                                <div className="flex items-center font-semibold capitalize text-xs md:text-sm">
                                   <UserTypeIcon userType={ticket.user_type} /> {ticket.user_type.replace('_', ' ')}
                                </div>
                            </li>
                        )) : <p className="text-sm md:text-xl text-center self-center text-text-secondary">Aguardando novas senhas...</p>}
                    </ul>
                </aside>
            </main>

            <footer className="w-full bg-panel-primary text-white text-center text-sm sm:text-base md:text-xl font-semibold p-2 md:p-3 mt-4 rounded-t-lg shadow-inner">
                JaboatãoPrev – Compromisso com o Futuro
            </footer>
        </div>
    );
};

export default PublicDisplayScreen;
