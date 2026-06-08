import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTodayQueue } from '@features/queue/contexts/TodayQueueContext';
import type { Ticket, Language } from '@shared/types';
import { TRANSLATIONS } from '@shared/constants';
import Toast from '@shared/components/Toast';
import { Print, KeyboardReturn, AccessTime, People } from '@mui/icons-material';
import { JaboataoPrevLogo } from '@shared/components/Logo';

const RETURN_TIMEOUT_SECONDS = 15;

interface TicketScreenProps {
    ticket: Ticket;
    onNewTicket: () => void;
    onExit?: () => void;
    fullscreenMode?: boolean;
    theme?: 'light' | 'dark';
}

const TicketScreen: React.FC<TicketScreenProps> = ({ 
    ticket, 
    onNewTicket, 
    onExit, 
    fullscreenMode,
    theme = 'dark'
}) => {
    const { todayTickets: tickets, calledTicket } = useTodayQueue();
    const [language] = useState<Language>('pt');
    const [countdown, setCountdown] = useState(RETURN_TIMEOUT_SECONDS);
    const isDark = theme === 'dark';
    
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        show: false,
        message: '',
        type: 'info',
    });

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
        return peopleAhead * 3;
    }, [peopleAhead]);

    const successMessage = useMemo(() => {
        if (ticket.is_priority) {
            return `Senha prioritária gerada com sucesso!`;
        }
        return TRANSLATIONS.ticketGeneratedSuccess[language];
    }, [ticket, language]);

    useEffect(() => {
        if (isMyTicketCalled) {
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
        setToast({ show: true, message: `Imprimindo via adicional: ${ticket.formatted_number}`, type: 'success' });
    };

    const handleReturnNow = useCallback(() => {
        onNewTicket();
    }, [onNewTicket]);

    return (
        <div className={`flex flex-col items-center justify-center w-full h-screen p-6 md:p-12 relative overflow-hidden select-none transition-colors duration-500 ${
            isDark 
                ? 'bg-gradient-to-tr from-[#081325] via-[#0c1a30] to-[#050b14] text-white' 
                : 'bg-gradient-to-tr from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] text-slate-800'
        }`}>
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            />

            {/* Background glowing ambient light */}
            <div className={`absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none transition-colors duration-500 ${
                isDark ? 'bg-blue-500/10' : 'bg-blue-200/40'
            }`}></div>
            <div className={`absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none transition-colors duration-500 ${
                isDark ? 'bg-[#204FA1]/10' : 'bg-slate-350/30'
            }`}></div>

            {/* Custom Printer Animation Stylesheet */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slide-out-printer {
                    0% {
                        transform: translateY(-90%);
                        opacity: 0.5;
                        filter: brightness(0.8);
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                        filter: brightness(1);
                    }
                }
                .ticket-serrated-border {
                    background-image: linear-gradient(135deg, transparent 75%, #f8fafc 75%), linear-gradient(225deg, transparent 75%, #f8fafc 75%);
                    background-position: 0 0, 0 0;
                    background-size: 16px 16px;
                }
            `}} />

            {/* Main container with simulated physical kiosk bezel */}
            <div className="w-full max-w-lg flex flex-col items-center my-auto z-10">
                {/* Kiosk Bezel printer slot */}
                <div className={`w-full h-14 border-b-[6px] rounded-t-3xl relative z-20 flex items-center justify-center transition-colors duration-500 ${
                    isDark 
                        ? 'bg-slate-900 border-slate-950 shadow-inner' 
                        : 'bg-slate-300 border-slate-400 shadow-md'
                }`}>
                    <div className="w-32 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10B981]"></div>
                    <span className="absolute bottom-1 right-4 text-[7px] text-slate-500 font-mono tracking-widest uppercase">PRINTER SLOT</span>
                </div>

                {/* Animated Physical Thermal Ticket */}
                <div className={`w-full bg-slate-50 text-slate-900 p-6 sm:p-8 rounded-b-3xl text-center relative overflow-hidden animate-[slide-out-printer_1.4s_cubic-bezier(0.16,1,0.3,1)_forwards] border-t border-slate-200 ${
                    isDark
                        ? 'shadow-[0_25px_60px_rgba(0,0,0,0.6)]'
                        : 'shadow-[0_25px_60px_rgba(30,41,59,0.22)]'
                }`}>
                    {/* Serrated line effect */}
                    <div className="absolute top-0 left-0 right-0 h-4 bg-slate-200 opacity-20 ticket-serrated-border"></div>

                    <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4 mt-2">
                        <JaboataoPrevLogo theme="light" />
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">VIA DO CIDADÃO</span>
                    </div>

                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{TRANSLATIONS.yourTicket[language]}</h2>
                    
                    <p className="my-3 text-6xl sm:text-7xl font-mono font-black text-slate-900 tracking-tighter leading-none select-none">
                        {ticket.formatted_number}
                    </p>

                    <div className="bg-slate-100 border border-slate-200 p-3 rounded-2xl mb-4 text-left">
                        <p className="text-sm font-black text-slate-800 uppercase tracking-wide">{ticket.service.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{ticket.service.description}</p>
                        {ticket.attendee_name && (
                            <p className="text-xs text-slate-800 mt-2 pt-2 border-t border-slate-200 font-medium">
                                Nome: <span className="font-bold uppercase text-blue-600">{ticket.attendee_name}</span>
                            </p>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 text-left mb-4">
                        <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl flex items-start gap-2">
                            <AccessTime className="text-slate-400 mt-0.5" sx={{ fontSize: 16 }} />
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Espera Estimada</p>
                                <p className="text-sm font-black text-slate-800">~{estimatedWaitTime} min</p>
                            </div>
                        </div>
                        <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl flex items-start gap-2">
                            <People className="text-slate-400 mt-0.5" sx={{ fontSize: 16 }} />
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pessoas na Frente</p>
                                <p className="text-sm font-black text-slate-800">{peopleAhead}</p>
                            </div>
                        </div>
                    </div>



                    <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                        Retire o papel da impressora
                    </div>
                </div>

                {/* Bottom Actions card */}
                <div className={`w-full backdrop-blur-md rounded-2xl p-4 mt-6 z-10 text-center transition-colors duration-500 border ${
                    isDark 
                        ? 'bg-slate-900/40 border-white/5 text-white' 
                        : 'bg-white/85 border-slate-200 text-slate-800 shadow-md'
                }`}>
                    <div className="mb-4">
                        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Retornando em <span className="text-amber-500 font-bold">{countdown}</span> segundos...
                        </p>
                        <div className={`w-full rounded-full h-1.5 mt-2 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                            <div 
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000 ease-linear" 
                                style={{ width: `${(countdown / RETURN_TIMEOUT_SECONDS) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleReprint} 
                            className={`flex-1 py-3 px-4 rounded-xl border text-xs sm:text-sm font-black uppercase tracking-wider active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5 shadow-md ${
                                isDark 
                                    ? 'border-emerald-500/20 bg-emerald-950/20 hover:bg-emerald-900/20 text-emerald-400' 
                                    : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-750'
                            }`}
                        >
                            <Print sx={{ fontSize: 16 }} />
                            Reimprimir
                        </button>
                        <button 
                            onClick={handleReturnNow} 
                            className={`flex-1 py-3 px-4 rounded-xl text-white text-xs sm:text-sm font-black uppercase tracking-wider active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5 shadow-lg ${
                                isDark 
                                    ? 'bg-[#204FA1] hover:bg-blue-700' 
                                    : 'bg-[#204FA1] hover:bg-blue-800'
                            }`}
                        >
                            <KeyboardReturn sx={{ fontSize: 16 }} />
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketScreen;
