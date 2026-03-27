
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTodayQueue } from '@features/queue/contexts/TodayQueueContext';
import { PANEL_CONFIG } from '@shared/constants';
import type { Ticket, UserType } from '@shared/types';

const JaboataoPrevLogo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center ${className}`}>
        <img src="/logo-jabprev.png" alt="JaboatãoPrev" className="h-20 w-auto object-contain" />
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

const notificationSound = '/sounds/campainha_geren_senhas_jabprev.mp3';

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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const previousInProgressIds = useRef<Set<string>>(new Set());

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Erro ao entrar em tela cheia:', err);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        if (PANEL_CONFIG.mostrarSons) {
            audioRef.current = new Audio(notificationSound);
            audioRef.current.volume = 0.8;
        }
    }, []);

    useEffect(() => {
        let timerId: number;

        const updateClock = () => {
            setCurrentTime(new Date());
            const now = Date.now();
            const delayToNextSecond = 1000 - (now % 1000);
            timerId = window.setTimeout(updateClock, delayToNextSecond);
        };

        updateClock();
        return () => window.clearTimeout(timerId);
    }, []);

    const inProgressTickets = useMemo(() => {
        return tickets
            .filter(t => t.status === 'in_progress' && t.started_at)
            .sort((a, b) => new Date(b.started_at!).getTime() - new Date(a.started_at!).getTime())
            .slice(0, PANEL_CONFIG.mostrarEmAtendimento);
    }, [tickets]);

    const mainInProgressTicket = inProgressTickets[0] || null;
    const secondaryInProgressTickets = inProgressTickets.slice(1);
    
    const waitingTickets = useMemo(() => {
        return tickets
            .filter(t => t.status === 'waiting')
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
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
        <div className="flex flex-col w-full h-screen overflow-hidden p-3 sm:p-4 md:p-6 bg-panel-bg font-poppins text-panel-secondary">
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
                <div className="flex items-center gap-3">
                <div className="text-right text-sm sm:text-base">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-panel-primary">{currentTime.toLocaleTimeString('pt-BR')}</p>
                    <p className="text-xs sm:text-sm md:text-base text-panel-secondary">{currentTime.toLocaleDateString('pt-BR', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                </div>
                    <button
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                        aria-label={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
                        className="p-2 sm:p-3 rounded-full bg-white/80 hover:bg-white transition-colors border border-border-color shadow-sm flex-shrink-0"
                    >
                        {isFullscreen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-panel-primary"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-panel-primary"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                        )}
                    </button>
                </div>
            </header>

            <main className="flex-grow min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <section className="md:col-span-2 bg-white/70 p-4 md:p-6 rounded-2xl shadow-lg min-h-0 overflow-hidden">
                    <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-panel-primary mb-3 md:mb-4 border-b-4 border-panel-primary pb-2">SENHAS EM ATENDIMENTO</h2>
                    {mainInProgressTicket ? (
                        <>
                            <div
                                className={`flex flex-col justify-center items-center p-6 md:p-8 rounded-2xl transition-all duration-300 mb-4 md:mb-6 min-h-[280px] md:min-h-[360px] ${
                                    mainInProgressTicket.id === lastCalledTicketId
                                        ? 'bg-jaboatao-green-prev/80 text-white shadow-2xl animate-pulse'
                                        : 'bg-white shadow-xl'
                                }`}
                            >
                                <p className={`font-bold text-xl md:text-3xl ${mainInProgressTicket.id === lastCalledTicketId ? 'text-white' : 'text-panel-secondary'}`}>
                                    {getGuicheForTicket(mainInProgressTicket)}
                                </p>
                                <p className={`font-bold text-7xl sm:text-8xl md:text-9xl my-3 tracking-tighter ${mainInProgressTicket.id === lastCalledTicketId ? 'text-white' : 'text-panel-primary'}`}>
                                    {mainInProgressTicket.formatted_number}
                                </p>
                                <p className={`text-lg md:text-2xl font-semibold mb-3 ${mainInProgressTicket.id === lastCalledTicketId ? 'text-white' : 'text-text-primary'}`}>
                                    {mainInProgressTicket.attendee_name || 'Nome nao informado'}
                                </p>
                                <div className={`flex items-center text-base md:text-2xl font-semibold border-4 rounded-lg px-4 md:px-5 py-2 border-blue-600/40 ${mainInProgressTicket.id === lastCalledTicketId ? 'text-white border-transparent' : 'text-blue-600'}`}>
                                    <div className="w-3 h-3 bg-blue-600 rounded-full mr-2 animate-ping"></div>
                                    Em Atendimento
                                </div>
                            </div>

                            {secondaryInProgressTickets.length > 0 && (
                                <div>
                                    <p className="text-sm md:text-base font-semibold text-panel-secondary mb-2">Outras senhas em atendimento</p>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {secondaryInProgressTickets.map(ticket => {
                                            const isNewlyCalled = ticket.id === lastCalledTicketId;
                                            return (
                                                <div
                                                    key={ticket.id}
                                                    className={`flex-shrink-0 min-w-[220px] md:min-w-[260px] flex flex-col justify-center items-center p-4 rounded-xl transition-all duration-300 ${
                                                        isNewlyCalled ? 'bg-jaboatao-green-prev/80 text-white shadow-xl animate-pulse' : 'bg-white shadow-md'
                                                    }`}
                                                >
                                                    <p className={`font-bold text-sm md:text-lg ${isNewlyCalled ? 'text-white' : 'text-panel-secondary'}`}>{getGuicheForTicket(ticket)}</p>
                                                    <p className={`font-bold text-4xl md:text-5xl my-1 tracking-tighter ${isNewlyCalled ? 'text-white' : 'text-panel-primary'}`}>{ticket.formatted_number}</p>
                                                    <p className={`text-sm md:text-base font-semibold ${isNewlyCalled ? 'text-white' : 'text-text-primary'}`}>{ticket.attendee_name || 'Nome nao informado'}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-base md:text-2xl text-center self-center text-text-secondary min-h-[150px] flex items-center justify-center">
                            Nenhuma senha em atendimento no momento.
                        </p>
                    )}
                </section>

                <aside className="md:col-span-1 bg-white/70 p-4 md:p-6 rounded-2xl shadow-lg flex flex-col h-full min-h-0 overflow-hidden">
                    <h2 className="font-poppins text-2xl sm:text-3xl md:text-3xl font-bold text-panel-primary mb-3 md:mb-4 border-b-4 border-panel-primary pb-2">PRÓXIMAS SENHAS</h2>
                    <ul className="space-y-3 flex-grow overflow-y-auto min-h-0">
                        {waitingTickets.length > 0 ? waitingTickets.map(ticket => (
                            <li key={ticket.id} className="flex items-center justify-between bg-white p-3 md:p-4 rounded-lg shadow-sm text-base md:text-2xl">
                                <div>
                                    <span className="font-bold text-panel-primary block">{ticket.formatted_number}</span>
                                    <span className="text-xs md:text-sm text-text-secondary block">{ticket.attendee_name || 'Nome nao informado'}</span>
                                </div>
                                <div className="flex items-center gap-1 font-semibold capitalize text-xs md:text-sm">
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
