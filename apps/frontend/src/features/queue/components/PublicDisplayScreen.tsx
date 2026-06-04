
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTodayQueue } from '@features/queue/contexts/TodayQueueContext';
import { supabase } from '@lib/supabase/client';
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
    const spokenTicketIds = useRef<Set<string>>(new Set());

    // Função para ler senha e nome em voz alta
    const speakTicket = (ticketNumber: string, attendeeName: string) => {
        if ('speechSynthesis' in window) {
            // Cancelar qualquer fala anterior
            window.speechSynthesis.cancel();

            // Pequeno delay de 800ms após campainha
            setTimeout(() => {
                const text = `Senha, ${ticketNumber}, ${attendeeName.toUpperCase()}`;
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'pt-BR';
                utterance.rate = 0.9;
                utterance.pitch = 1;
                utterance.volume = 1;
                window.speechSynthesis.speak(utterance);
            }, 800);
        }
    };

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
            // Sincronizar com timezone de Jaboatão, Pernambuco (America/Recife - UTC-3)
            const jaboataoTime = new Date(new Date().toLocaleString('pt-BR', { timeZone: 'America/Recife' }));
            setCurrentTime(jaboataoTime);
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

    // Histórico: senhas já atendidas (completed) do dia
    const historyTickets = useMemo(() => {
        return tickets
            .filter(t => t.status === 'completed' && t.started_at)
            .sort((a, b) => new Date(b.started_at!).getTime() - new Date(a.started_at!).getTime())
            .slice(0, 15);
    }, [tickets]);

    // Ouve o evento de chamar novamente (ticket_recall)
    useEffect(() => {
        const channel = supabase.channel('tickets-live-updates');

        channel.on('broadcast', { event: 'ticket_recall' }, (payload) => {
            const ticketId = payload.payload?.ticketId;
            if (ticketId) {
                setLastCalledTicketId(ticketId);

                if (PANEL_CONFIG.mostrarSons && audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(e => console.error("Error playing sound:", e));
                }

                const ticket = tickets.find(t => t.id === ticketId);
                if (ticket && ticket.formatted_number && ticket.attendee_name) {
                    speakTicket(ticket.formatted_number, ticket.attendee_name);
                }

                setTimeout(() => {
                    setLastCalledTicketId(null);
                }, 5000);
            }
        }).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
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

            // Ler senha e nome em voz alta (apenas uma vez por ticket)
            if (!spokenTicketIds.current.has(latestCallId)) {
                const ticket = inProgressTickets.find(t => t.id === latestCallId);
                if (ticket && ticket.formatted_number && ticket.attendee_name) {
                    speakTicket(ticket.formatted_number, ticket.attendee_name);
                    spokenTicketIds.current.add(latestCallId);
                }
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-panel-primary"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-panel-primary"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-panel-primary"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
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
                                className={`flex flex-col justify-center items-center p-6 md:p-8 rounded-2xl transition-all duration-300 mb-4 md:mb-6 min-h-[280px] md:min-h-[360px] ${mainInProgressTicket.id === lastCalledTicketId
                                    ? 'bg-jaboatao-green-prev/80 text-white shadow-2xl animate-pulse'
                                    : 'bg-white shadow-xl'
                                    }`}
                            >
                                <p className={`font-bold text-xl md:text-3xl ${mainInProgressTicket.id === lastCalledTicketId ? 'text-white' : 'text-panel-secondary'}`}>
                                    {getGuicheForTicket(mainInProgressTicket)}
                                </p>
                                <p className={`font-bold text-5xl sm:text-6xl md:text-7xl my-2 tracking-tighter ${mainInProgressTicket.id === lastCalledTicketId ? 'text-white' : 'text-panel-primary'}`}>
                                    {mainInProgressTicket.formatted_number}
                                </p>
                                <p className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-1 ${mainInProgressTicket.id === lastCalledTicketId ? 'text-white' : 'text-text-primary'}`}>
                                    {(mainInProgressTicket.attendee_name || 'Nome nao informado').toUpperCase()}
                                </p>
                                {mainInProgressTicket.service?.name && (
                                    <p className={`text-lg md:text-2xl font-medium mb-3 ${mainInProgressTicket.id === lastCalledTicketId ? 'text-white/80' : 'text-panel-secondary'}`}>
                                        {mainInProgressTicket.service.name}
                                    </p>
                                )}
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
                                                    className={`flex-shrink-0 min-w-[220px] md:min-w-[260px] flex flex-col justify-center items-center p-4 rounded-xl transition-all duration-300 ${isNewlyCalled ? 'bg-jaboatao-green-prev/80 text-white shadow-xl animate-pulse' : 'bg-white shadow-md'
                                                        }`}
                                                >
                                                    <p className={`font-bold text-sm md:text-lg ${isNewlyCalled ? 'text-white' : 'text-panel-secondary'}`}>{getGuicheForTicket(ticket)}</p>
                                                    <p className={`font-bold text-4xl md:text-5xl my-1 tracking-tighter ${isNewlyCalled ? 'text-white' : 'text-panel-primary'}`}>{ticket.formatted_number}</p>
                                                    <p className={`text-sm md:text-base font-semibold ${isNewlyCalled ? 'text-white' : 'text-text-primary'}`}>{(ticket.attendee_name || 'Nome nao informado').toUpperCase()}</p>
                                                    {ticket.service?.name && <p className={`text-xs md:text-sm ${isNewlyCalled ? 'text-white/70' : 'text-panel-secondary'}`}>{ticket.service.name}</p>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Imagem Institucional */}
                            <div className="mt-4 rounded-xl overflow-hidden shadow-md flex justify-center bg-white/50">
                                <img src="/images/Logo/logo-longa.png" alt="Fachada JaboatãoPrev" className="max-h-[200px] w-auto object-cover" />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[300px]">
                            <p className="text-base md:text-2xl text-center text-text-secondary mb-8">
                                Nenhuma senha em atendimento no momento.
                            </p>
                            <div className="rounded-xl overflow-hidden shadow-md">
                                <img src="/images/Logo/logo-longa.png" alt="Fachada JaboatãoPrev" className="max-h-[300px] w-auto object-cover" />
                            </div>
                        </div>
                    )}
                </section>

                <aside className="md:col-span-1 bg-white/70 p-4 md:p-6 rounded-2xl shadow-lg flex flex-col h-full min-h-0 overflow-hidden">
                    <h2 className="font-poppins text-2xl sm:text-3xl md:text-3xl font-bold text-panel-primary mb-3 md:mb-4 border-b-4 border-panel-primary pb-2">PRÓXIMAS SENHAS</h2>
                    <ul className="space-y-3 flex-grow overflow-y-auto min-h-0">
                        {waitingTickets.length > 0 ? waitingTickets.map(ticket => (
                            <li key={ticket.id} className="flex items-center justify-between bg-white p-3 md:p-4 rounded-lg shadow-sm text-base md:text-2xl">
                                <div>
                                    <span className="font-bold text-panel-primary block">{ticket.formatted_number}</span>
                                    <span className="text-xs md:text-sm text-text-secondary block">{(ticket.attendee_name || 'Nome nao informado').toUpperCase()}</span>
                                    {ticket.service?.name && <span className="text-[10px] md:text-xs text-panel-secondary block">{ticket.service.name}</span>}
                                </div>
                                <div className="flex items-center gap-1 font-semibold capitalize text-xs md:text-sm">
                                    <UserTypeIcon userType={ticket.user_type} /> {ticket.user_type.replace('_', ' ')}
                                </div>
                            </li>
                        )) : <p className="text-sm md:text-xl text-center self-center text-text-secondary">Aguardando novas senhas...</p>}
                    </ul>
                </aside>
            </main>

            {/* Histórico horizontal de atendimentos anteriores */}
            {historyTickets.length > 0 && (
                <section className="mt-3 bg-white/70 rounded-2xl shadow-lg p-3 md:p-4 flex-shrink-0">
                    <h3 className="font-poppins text-sm md:text-base font-bold text-panel-primary mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
                        ATENDIMENTOS ANTERIORES
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                        {historyTickets.map(ticket => (
                            <div
                                key={ticket.id}
                                className="flex-shrink-0 bg-white rounded-xl shadow-sm border border-border-color px-4 py-2 min-w-[160px] md:min-w-[200px]"
                            >
                                <p className="font-bold text-lg md:text-xl text-panel-primary tracking-tight">{ticket.formatted_number}</p>
                                <p className="text-xs md:text-sm text-text-secondary truncate">{(ticket.attendee_name || 'Nome nao informado').toUpperCase()}</p>
                                {ticket.service?.name && <p className="text-[10px] md:text-xs text-panel-secondary truncate">{ticket.service.name}</p>}
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[10px] md:text-xs text-jaboatao-green-prev font-semibold">✔ Finalizado</span>
                                    <span className="flex items-center gap-0.5 text-[10px] md:text-xs text-panel-secondary capitalize">
                                        <UserTypeIcon userType={ticket.user_type} /> {ticket.user_type.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <footer className="w-full bg-panel-primary text-white text-center text-sm sm:text-base md:text-xl font-semibold p-2 md:p-3 mt-3 rounded-t-lg shadow-inner flex-shrink-0">
                JaboatãoPrev – Compromisso com o Futuro
            </footer>
        </div>
    );
};

export default PublicDisplayScreen;
