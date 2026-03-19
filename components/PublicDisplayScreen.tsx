import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQueue } from '../contexts/QueueContext';
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
    const iconClass = "w-8 h-8 inline-block mr-2 text-panel-secondary";
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
    if (ticket.isPriority) return 'Guichê 1 (Prioritário)';
    switch (ticket.service.category) {
        case 'Gerência de Benefícios': return 'Guichê 2';
        case 'Gerência de Folha de Pagamento': return 'Guichê 3';
        case 'Gerência Jurídica': return 'Guichê 4';
        default: return 'Guichê 5';
    }
};

interface PublicDisplayScreenProps {
    onBack: () => void;
}

const PublicDisplayScreen: React.FC<PublicDisplayScreenProps> = ({ onBack }) => {
    const { tickets } = useQueue();
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
            .filter(t => t.status === 'in_progress')
            .sort((a, b) => (b.startedAt?.getTime() ?? 0) - (a.startedAt?.getTime() ?? 0))
            .slice(0, PANEL_CONFIG.mostrarEmAtendimento);
    }, [tickets, currentTime]);
    
    const waitingTickets = useMemo(() => {
        return tickets
            .filter(t => t.status === 'waiting')
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .slice(0, PANEL_CONFIG.mostrarProximas);
    }, [tickets, currentTime]);

    useEffect(() => {
        const currentInProgressIds = new Set(inProgressTickets.map(t => t.id));
        
        // Find newly added tickets to "in_progress"
        const newCalls = [...currentInProgressIds].filter(id => !previousInProgressIds.current.has(id));

        if (newCalls.length > 0) {
            const latestCallId = newCalls[0]; // Assuming one call at a time for simplicity
            setLastCalledTicketId(latestCallId);
            
            if (PANEL_CONFIG.mostrarSons && audioRef.current) {
                audioRef.current.play().catch(e => console.error("Error playing sound:", e));
            }

            setTimeout(() => {
                setLastCalledTicketId(null);
            }, 3000); // Animation duration
        }

        previousInProgressIds.current = currentInProgressIds;
    }, [inProgressTickets]);

    return (
        <div className="flex flex-col w-full min-h-screen p-6 bg-panel-bg font-poppins text-panel-secondary">
            <header className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={onBack} 
                        className="p-3 rounded-full bg-white/80 hover:bg-white transition-colors border border-border-color shadow-sm" 
                        aria-label="Voltar para a tela inicial"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-panel-primary"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                    </button>
                    <JaboataoPrevLogo />
                </div>
                <div className="text-right">
                    <p className="text-4xl font-bold text-panel-primary">{currentTime.toLocaleTimeString('pt-BR')}</p>
                    <p className="text-xl text-panel-secondary">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            <main className="flex-grow grid grid-cols-3 gap-6">
                {/* Atendimento */}
                <section className="col-span-2 bg-white/70 p-6 rounded-2xl shadow-lg">
                    <h2 className="font-poppins text-4xl font-bold text-panel-primary mb-4 border-b-4 border-panel-primary pb-2">SENHAS EM ATENDIMENTO</h2>
                    <div className="grid grid-cols-2 gap-6 h-[calc(100%-60px)]">
                        {inProgressTickets.length > 0 ? inProgressTickets.map(ticket => {
                             const isNewlyCalled = ticket.id === lastCalledTicketId;
                             return (
                                <div key={ticket.id} className={`flex flex-col justify-center items-center p-4 rounded-xl transition-all duration-300 ${isNewlyCalled ? 'bg-jaboatao-green-prev/80 text-white shadow-2xl scale-105' : 'bg-white shadow-md'}`}>
                                    <p className={`font-bold text-2xl ${isNewlyCalled ? 'text-white' : 'text-panel-secondary'}`}>{getGuicheForTicket(ticket)}</p>
                                    <p className={`font-bold text-8xl my-2 tracking-tighter ${isNewlyCalled ? 'text-white' : 'text-panel-primary'}`}>{ticket.formattedNumber}</p>
                                    <div className={`flex items-center text-xl font-semibold border-4 rounded-lg px-4 py-2 animate-border-pulse border-blue-600/40 ${isNewlyCalled ? 'text-white border-transparent' : 'text-blue-600'}`}>
                                        <div className="w-3 h-3 bg-blue-600 rounded-full mr-2 animate-ping"></div>
                                        Em Atendimento
                                    </div>
                                </div>
                            )
                        }) : <p className="col-span-2 text-2xl text-center self-center text-text-secondary">Nenhuma senha em atendimento no momento.</p>}
                    </div>
                </section>

                {/* Próximas */}
                <aside className="col-span-1 bg-white/70 p-6 rounded-2xl shadow-lg flex flex-col">
                    <h2 className="font-poppins text-3xl font-bold text-panel-primary mb-4 border-b-4 border-panel-primary pb-2">PRÓXIMAS SENHAS</h2>
                    <ul className="space-y-4 flex-grow">
                        {waitingTickets.length > 0 ? waitingTickets.map(ticket => (
                            <li key={ticket.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm text-2xl">
                                <span className="font-bold text-panel-primary">{ticket.formattedNumber}</span>
                                <div className="flex items-center font-semibold capitalize">
                                   <UserTypeIcon userType={ticket.userType} /> {ticket.userType.replace('_', ' ')}
                                </div>
                            </li>
                        )) : <p className="text-xl text-center self-center text-text-secondary">Aguardando novas senhas...</p>}
                    </ul>
                </aside>
            </main>

            <footer className="w-full bg-panel-primary text-white text-center text-xl font-semibold p-3 mt-4 rounded-t-lg shadow-inner">
                JaboatãoPrev – Compromisso com o Futuro | Prefeitura do Jaboatão dos Guararapes
            </footer>
        </div>
    );
};

export default PublicDisplayScreen;