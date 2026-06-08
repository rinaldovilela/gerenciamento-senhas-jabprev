import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTodayQueue } from '@features/queue/contexts/TodayQueueContext';
import { supabase } from '@lib/supabase/client';
import { PANEL_CONFIG } from '@shared/constants';
import type { Ticket, UserType } from '@shared/types';
import { 
  VolumeUp, 
  Fullscreen, 
  FullscreenExit, 
  ArrowBack,
  AccessTime,
  QueuePlayNext,
  History,
  MeetingRoom,
  Campaign,
  Shield,
  Devices,
  Favorite
} from '@mui/icons-material';

const JaboataoPrevLogo: React.FC<{ className?: string; dark?: boolean }> = ({ className, dark }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <div className={`p-2.5 rounded-xl border transition-all duration-300 ${dark ? 'bg-white/10 border-white/10' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
            <img 
                src="/logo-jabprev.png" 
                alt="JaboatãoPrev" 
                className={`h-9 w-auto object-contain transition-all duration-300 ${dark ? 'brightness-0 invert' : ''}`} 
            />
        </div>
        <div className="flex flex-col">
            <span className={`font-montserrat font-extrabold text-sm tracking-wider leading-none ${dark ? 'text-white' : 'text-[#204FA1]'}`}>JABOATÃO</span>
            <span className={`font-poppins font-bold text-[10px] tracking-widest leading-none mt-1 ${dark ? 'text-amber-400' : 'text-slate-500'}`}>PREV</span>
        </div>
    </div>
);

const UserTypeIcon: React.FC<{ userType: UserType }> = ({ userType }) => {
    switch (userType) {
        case 'aposentado': return <span className="text-xl" title="Aposentado">👴</span>;
        case 'pensionista': return <span className="text-xl" title="Pensionista">👵</span>;
        case 'servidor_ativo': return <span className="text-xl" title="Servidor Ativo">👨‍💼</span>;
        default: return null;
    }
};

const notificationSound = '/sounds/campainha_geren_senhas_jabprev.mp3';

const getGuicheForTicket = (ticket: Ticket): string => {
    if (ticket.is_priority) return 'Guichê 1 (Prioritário)';
    return 'Guichê 2 (Geral)';
};

const getAtendenteOrGuiche = (ticket: Ticket): string => {
    if (ticket.operator?.name) {
        return `Atendente: ${ticket.operator.name}`;
    }
    return getGuicheForTicket(ticket);
};


// Slides corporativos super leves (substituem player de vídeo pesado)
interface SlideItem {
    id: number;
    title: string;
    description: string;
    tag: string;
    icon: React.ReactNode;
    color: string;
}

const INFO_SLIDES: SlideItem[] = [
    {
        id: 1,
        title: "Prova de Vida Automática",
        description: "Agora realizada de forma eletrônica cruzando dados do Governo Federal. Sem filas, sem preocupações.",
        tag: "Inovação JaboatãoPrev",
        icon: <Shield sx={{ fontSize: 40 }} className="text-amber-400" />,
        color: "from-blue-900/60 to-indigo-950/60"
    },
    {
        id: 2,
        title: "Portal do Segurado",
        description: "Acesse seus contracheques, informes de rendimento e dê entrada em serviços online: jabprev.jaboatao.pe.gov.br",
        tag: "Serviço Digital",
        icon: <Devices sx={{ fontSize: 40 }} className="text-emerald-400" />,
        color: "from-teal-900/60 to-emerald-950/60"
    },
    {
        id: 3,
        title: "Prevenção e Qualidade de Vida",
        description: "Mantenha hábitos saudáveis e realize exames preventivos periódicos. Cuidar de você é o nosso compromisso.",
        tag: "Dica de Saúde",
        icon: <Favorite sx={{ fontSize: 40 }} className="text-rose-400" />,
        color: "from-rose-900/60 to-slate-950/60"
    }
];

const NEWS_TICKER_TEXTS = [
    "Atenção: A Prova de Vida agora é realizada de forma automática pelo JaboatãoPrev através de cruzamento de dados federais.",
    "Acesse o Portal do Segurado: jabprev.jaboatao.pe.gov.br e consulte seu contracheque e informe de rendimentos.",
    "JaboatãoPrev — Compromisso com o Futuro e Acessibilidade do Servidor."
];

interface PublicDisplayScreenProps {
    onBack: () => void;
    theme?: 'light' | 'dark';
}

const PublicDisplayScreen: React.FC<PublicDisplayScreenProps> = ({ onBack, theme = 'dark' }) => {
    const isDark = theme === 'dark';
    const { todayTickets: tickets } = useTodayQueue();
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Controle do Takeover (Senha Chamada)
    const [activeTakeoverTicket, setActiveTakeoverTicket] = useState<Ticket | null>(null);
    const [lastCalledTicketId, setLastCalledTicketId] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Controle do Carrossel de Mídia
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

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

    const historyTickets = useMemo(() => {
        return tickets
            .filter(t => t.status === 'completed' && t.started_at)
            .sort((a, b) => new Date(b.started_at!).getTime() - new Date(a.started_at!).getTime())
            .slice(0, 5);
    }, [tickets]);


    const audioRef = useRef<HTMLAudioElement | null>(null);
    const previousInProgressIds = useRef<Set<string>>(new Set());
    const spokenTicketIds = useRef<Set<string>>(new Set());

    // Refs de concorrência
    const activeTakeoverTicketRef = useRef<Ticket | null>(null);
    const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fila serial de chamadas
    const callQueueRef = useRef<Ticket[]>([]);
    const isProcessingQueueRef = useRef<boolean>(false);

    // Limpeza no desmonte
    useEffect(() => {
        return () => {
            if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
            if (pollingRef.current) clearInterval(pollingRef.current);
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        };
    }, []);

    // Prefetch de vozes
    useEffect(() => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.getVoices();
        const h = () => window.speechSynthesis.getVoices();
        window.speechSynthesis.addEventListener('voiceschanged', h);
        return () => window.speechSynthesis.removeEventListener('voiceschanged', h);
    }, []);

    // ═══════════════════════════════════════════════════════
    // speakTicket: retorna uma Promise que resolve quando a fala termina.
    // Simples, linear, sem race conditions.
    // ═══════════════════════════════════════════════════════
    const speakTicketAsync = (ticket: Ticket): Promise<void> => {
        return new Promise<void>((resolve) => {
            if (!('speechSynthesis' in window)) {
                setTimeout(resolve, 5000);
                return;
            }

            // Garantir que qualquer fala anterior foi cancelada
            window.speechSynthesis.cancel();

            const ticketNumber = ticket.formatted_number;
            const formattedSpeechNumber = ticketNumber.replace('-', ' ').split('').join(' ');
            const attendeeName = ticket.attendee_name?.trim();
            const serviceName = ticket.service?.name || 'Atendimento Geral';
            const operatorName = ticket.operator?.name || null;
            const guicheText = getGuicheForTicket(ticket);

            let text = `Senha, número ${formattedSpeechNumber}.`;
            if (attendeeName) text += ` Solicitante, ${attendeeName}.`;
            text += ` Assunto, ${serviceName}.`;
            if (operatorName) {
                text += ` Atendimento com ${operatorName}.`;
            } else {
                text += ` Dirija-se ao ${guicheText}.`;
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';

            const voices = window.speechSynthesis.getVoices();
            const ptVoice =
                voices.find(v => v.lang.startsWith('pt') &&
                    (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural'))) ||
                voices.find(v => v.lang.startsWith('pt'));
            if (ptVoice) utterance.voice = ptVoice;

            utterance.rate = 0.82;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
                resolve();
            };

            // onend = caminho feliz
            utterance.onend = finish;
            // onerror = SEMPRE resolve (nunca travar)
            utterance.onerror = finish;

            // Speak de fato
            window.speechSynthesis.speak(utterance);

            // Polling: a cada 400ms checa se a fala acabou sem onend
            // Espera 3 ciclos (1.2s) antes de checar, para dar tempo do speak() iniciar
            let polls = 0;
            pollingRef.current = setInterval(() => {
                polls++;
                if (done) { clearInterval(pollingRef.current!); pollingRef.current = null; return; }
                if (polls > 3 && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                    console.warn('[TTS] Fala terminou sem onend — resolvendo via polling');
                    finish();
                }
            }, 400);
        });
    };

    // ═══════════════════════════════════════════════════════
    // processNextInQueue: processa um ticket por vez, em série.
    // ═══════════════════════════════════════════════════════
    const processNextInQueue = async () => {
        if (isProcessingQueueRef.current) return;
        if (callQueueRef.current.length === 0) return;

        isProcessingQueueRef.current = true;

        while (callQueueRef.current.length > 0) {
            const ticket = callQueueRef.current.shift()!;

            // Mostrar o modal
            setActiveTakeoverTicket(ticket);
            activeTakeoverTicketRef.current = ticket;
            setLastCalledTicketId(ticket.id);

            // Tocar beep
            if (PANEL_CONFIG.mostrarSons && audioRef.current) {
                audioRef.current.currentTime = 0;
                try { await audioRef.current.play(); } catch (_e) { /* autoplay blocked */ }
            }

            // Esperar 600ms para o beep não atropelar a voz
            await new Promise(r => setTimeout(r, 600));

            // Falar a senha — com safety timeout de 18s
            if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

            await Promise.race([
                speakTicketAsync(ticket),
                new Promise<void>(r => {
                    safetyTimeoutRef.current = setTimeout(() => {
                        console.warn(`[Queue] Safety timeout para ${ticket.formatted_number}`);
                        window.speechSynthesis.cancel();
                        r();
                    }, 18000);
                })
            ]);

            if (safetyTimeoutRef.current) { clearTimeout(safetyTimeoutRef.current); safetyTimeoutRef.current = null; }

            // Fechar modal
            setActiveTakeoverTicket(null);
            activeTakeoverTicketRef.current = null;
            setLastCalledTicketId(null);

            // Pausa entre chamadas
            await new Promise(r => setTimeout(r, 500));
        }

        isProcessingQueueRef.current = false;
    };

    const enqueueTicket = (ticket: Ticket) => {
        if (callQueueRef.current.some(t => t.id === ticket.id)) return;
        callQueueRef.current.push(ticket);
        processNextInQueue();
    };

    const ticketsRef = useRef(tickets);
    useEffect(() => {
        ticketsRef.current = tickets;
    }, [tickets]);

    // Canal Supabase (Recall Manual)
    useEffect(() => {
        const channel = supabase.channel('tickets-live-updates');
        channel.on('broadcast', { event: 'ticket_recall' }, (payload) => {
            const ticketId = payload.payload?.ticketId;
            if (ticketId) {
                const ticket = ticketsRef.current.find(t => t.id === ticketId);
                if (ticket) enqueueTicket(ticket);
            }
        }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // Chamadas automáticas de novas senhas
    useEffect(() => {
        const currentInProgressIds = new Set(inProgressTickets.map(t => t.id));
        const newCalls = [...currentInProgressIds].filter(id => !previousInProgressIds.current.has(id));

        if (newCalls.length > 0) {
            newCalls.forEach(id => {
                const ticket = inProgressTickets.find(t => t.id === id);
                if (ticket && !spokenTicketIds.current.has(id)) {
                    spokenTicketIds.current.add(id);
                    enqueueTicket(ticket);
                }
            });
        }
        previousInProgressIds.current = currentInProgressIds;
    }, [inProgressTickets]);

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
            audioRef.current.volume = 0.95;
        }
    }, []);

    // Relógio
    useEffect(() => {
        let timerId: number;
        const updateClock = () => {
            const jaboataoTime = new Date(new Date().toLocaleString('pt-BR', { timeZone: 'America/Recife' }));
            setCurrentTime(jaboataoTime);
            const now = Date.now();
            const delayToNextSecond = 1000 - (now % 1000);
            timerId = window.setTimeout(updateClock, delayToNextSecond);
        };
        updateClock();
        return () => window.clearTimeout(timerId);
    }, []);

    // Timer do Carrossel de Mídia (8 segundos por slide)
    useEffect(() => {
        const slideTimer = setInterval(() => {
            setCurrentSlideIndex(prev => (prev + 1) % INFO_SLIDES.length);
        }, 8000);
        return () => clearInterval(slideTimer);
    }, []);


    // Combina os textos do News Ticker em uma única string
    const fullTickerText = useMemo(() => {
        return NEWS_TICKER_TEXTS.join("  •  ");
    }, []);

    return (
        <div 
            className={`public-display-container flex flex-col w-full h-screen overflow-hidden p-4 sm:p-5 bg-cover bg-center bg-no-repeat relative select-none ${isDark ? 'text-white' : 'text-slate-800'}`}
            style={{ backgroundImage: 'url("/images/Bandeira/bandeira.jpeg")' }}
        >
            {/* Custom stylesheet for responsive layout preservation during browser zoom */}
            <style dangerouslySetInnerHTML={{__html: `
                /* Reduções de Layout em Telas Menores ou com Zoom Alto */
                @media (max-height: 850px) {
                    .public-display-container {
                        padding: 10px !important;
                    }
                    .public-display-main {
                        gap: 12px !important;
                        margin-bottom: 8px !important;
                    }
                    .slideshow-container {
                        padding: 16px !important;
                    }
                    .slideshow-content {
                        margin-top: auto !important;
                        margin-bottom: auto !important;
                        padding-top: 4px !important;
                        padding-bottom: 4px !important;
                    }
                    .slideshow-description {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        font-size: 0.825rem !important;
                    }
                    .history-section {
                        display: none !important;
                    }
                    .takeover-guiche {
                        font-size: 0.875rem !important;
                        padding: 4px 12px !important;
                    }
                    .takeover-title {
                        font-size: 1.75rem !important;
                    }
                }
                
                @media (max-height: 640px) {
                    .slideshow-container {
                        display: none !important;
                    }
                    .ticker-container {
                        padding-top: 6px !important;
                        padding-bottom: 6px !important;
                    }
                    .takeover-title {
                        font-size: 1.25rem !important;
                    }
                    .takeover-service {
                        display: none !important;
                    }
                }
            `}} />

            {/* Backdrop Blur + Gradient Overlay */}
            <div className={`absolute inset-0 backdrop-blur-[8px] pointer-events-none z-0 ${isDark ? 'bg-slate-950/85' : 'bg-slate-50/80'}`}></div>

            {/* Header */}
            <header className={`flex justify-between items-center mb-4 z-10 relative border-b pb-3 ${isDark ? 'border-white/10' : 'border-slate-200/60'}`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className={`p-2.5 rounded-full transition-all border shadow-sm active:scale-95 flex items-center justify-center ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-white/60 hover:bg-white/90 border-slate-200/80'}`}
                        aria-label="Voltar"
                    >
                        <ArrowBack sx={{ fontSize: 20 }} className={isDark ? 'text-white' : 'text-slate-700'} />
                    </button>
                    <JaboataoPrevLogo dark={isDark} />
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className={`text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2 justify-end ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            <AccessTime sx={{ fontSize: 26 }} className="text-amber-400" />
                            {currentTime.toLocaleTimeString('pt-BR')}
                        </p>
                        <p className={`text-[10px] uppercase font-black tracking-widest mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <button
                        onClick={toggleFullscreen}
                        className={`p-2.5 rounded-full border shadow-sm flex-shrink-0 active:scale-95 flex items-center justify-center ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-white/60 hover:bg-white/90 border-slate-200/80'}`}
                    >
                        {isFullscreen ? (
                            <FullscreenExit sx={{ fontSize: 22 }} className={isDark ? 'text-white' : 'text-slate-700'} />
                        ) : (
                            <Fullscreen sx={{ fontSize: 22 }} className={isDark ? 'text-white' : 'text-slate-700'} />
                        )}
                    </button>
                </div>
            </header>

            {/* Main Bento Grid */}
            <main className="public-display-main flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-5 z-10 relative mb-4">
                
                {/* COLUNA ESQUERDA (2/3): Atendimento Ativo & Slideshow */}
                <section className="lg:col-span-2 flex flex-col gap-5 min-h-0">
                    
                    {/* Slideshow Informativo JaboatãoPrev */}
                    <div className={`slideshow-container flex-grow border rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-0 backdrop-blur-md ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-slate-200/60 bg-white/55 shadow-md shadow-slate-200/40'}`}>
                        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-blue-500/5' : 'bg-blue-100/60'}`}></div>
                        
                        {/* Slide Tag */}
                        <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-white/5' : 'border-slate-200/60'}`}>
                            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-500">
                                <Campaign sx={{ fontSize: 18 }} />
                                Informativo JaboatãoPrev
                            </span>
                            <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${isDark ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-slate-100/80 border-slate-200/60 text-slate-500'}`}>
                                {INFO_SLIDES[currentSlideIndex].tag}
                            </span>
                        </div>

                        {/* Slide Content */}
                        <div className="slideshow-content my-auto py-4 flex flex-col sm:flex-row items-center gap-6 transition-all duration-500">
                            <div className={`p-5 border rounded-2xl shadow-inner shrink-0 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-slate-200/60 shadow-slate-100'}`}>
                                {INFO_SLIDES[currentSlideIndex].icon}
                            </div>
                            <div className="space-y-2.5 text-center sm:text-left">
                                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {INFO_SLIDES[currentSlideIndex].title}
                                </h2>
                                <p className={`slideshow-description text-sm sm:text-base font-semibold leading-relaxed max-w-xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {INFO_SLIDES[currentSlideIndex].description}
                                </p>
                            </div>
                        </div>

                        {/* Slide Dots */}
                        <div className={`flex justify-center gap-2 border-t pt-3 ${isDark ? 'border-white/5' : 'border-slate-200/60'}`}>
                            {INFO_SLIDES.map((slide, idx) => (
                                <button
                                    key={slide.id}
                                    onClick={() => setCurrentSlideIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        currentSlideIndex === idx ? 'w-6 bg-amber-400' : `w-2 ${isDark ? 'bg-white/20' : 'bg-slate-300'}`
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Senha em Atendimento Ativa */}
                    <div className={`flex-shrink-0 border rounded-3xl p-5 flex items-center justify-between gap-6 shadow-xl backdrop-blur-md ${isDark ? 'border-white/10 bg-slate-900/60' : 'border-slate-200/60 bg-white/60 shadow-slate-200/50'}`}>
                        {mainInProgressTicket ? (
                            <>
                                <div className="min-w-0 flex items-center gap-5">
                                    <div className="w-14 h-14 bg-gradient-to-tr from-jaboatao-blue to-[#407BDE] text-white font-montserrat font-black rounded-2xl flex items-center justify-center text-xl shadow-md shadow-blue-950/20 shrink-0">
                                        {mainInProgressTicket.formatted_number.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Última Senha Chamada</p>
                                        <h3 className={`font-montserrat font-black text-3xl tracking-tighter mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{mainInProgressTicket.formatted_number}</h3>
                                        <p className={`text-xs font-bold truncate mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{(mainInProgressTicket.attendee_name || 'Cidadão').toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="px-3.5 py-1.5 bg-jaboatao-blue/20 border border-jaboatao-blue/30 text-[#407BDE] text-[10px] font-black uppercase tracking-wider rounded-xl">
                                        {getAtendenteOrGuiche(mainInProgressTicket)}
                                    </span>
                                    <div className="flex items-center gap-1.5 justify-end mt-2 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                        Ativo
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className={`text-xs font-bold text-center w-full py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Nenhuma senha ativa em atendimento.</p>
                        )}
                    </div>

                    {/* Secondary in-progress Tickets (Outros guichês) */}
                    {secondaryInProgressTickets.length > 0 && (
                        <div className="flex-shrink-0">
                            <h3 className={`text-[9px] font-black uppercase tracking-widest mb-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Atendimentos Simultâneos</h3>
                            <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
                                {secondaryInProgressTickets.map(ticket => (
                                    <div
                                        key={ticket.id}
                                        className={`flex-shrink-0 min-w-[220px] p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between gap-4 ${isDark ? 'border-white/5 bg-slate-900/50' : 'border-slate-200/60 bg-white/55 shadow-sm'}`}
                                    >
                                        <div>
                                            <p className={`text-[8px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{getAtendenteOrGuiche(ticket)}</p>
                                            <p className={`font-montserrat font-black text-xl tracking-tighter mt-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.formatted_number}</p>
                                            <p className={`text-[10px] font-bold truncate max-w-[130px] mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{(ticket.attendee_name || 'Cidadão').toUpperCase()}</p>
                                        </div>
                                        <span className={`px-2 py-1 border rounded-lg text-[8px] font-black uppercase ${isDark ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-slate-100/80 border-slate-200/60 text-slate-500'}`}>
                                            {ticket.user_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* COLUNA DIREITA (1/3): Próximas Senhas na Fila */}
                <aside className={`lg:col-span-1 border rounded-3xl p-5 shadow-2xl flex flex-col h-full min-h-0 backdrop-blur-md ${isDark ? 'border-white/10 bg-slate-900/60' : 'border-slate-200/60 bg-white/60 shadow-slate-200/50'}`}>
                    <h2 className={`text-[10px] font-black uppercase tracking-widest mb-3.5 flex items-center gap-2 border-b pb-2.5 ${isDark ? 'text-slate-400 border-white/10' : 'text-slate-500 border-slate-200/60'}`}>
                        <QueuePlayNext sx={{ fontSize: 16 }} className="text-amber-500" />
                        Próximas Senhas
                    </h2>
                    
                    <div className="flex-grow overflow-y-auto min-h-0 space-y-2.5 pr-1 scrollbar-none">
                        {waitingTickets.length > 0 ? (
                            waitingTickets.map((ticket, idx) => (
                                <div 
                                    key={ticket.id} 
                                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                                        idx === 0 
                                            ? 'border-amber-500/30 bg-amber-500/5 shadow-sm shadow-amber-500/5' 
                                            : isDark ? 'border-white/5 bg-slate-900/40' : 'border-slate-200/50 bg-white/40'
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <span className={`font-montserrat font-black text-xl tracking-tighter ${idx === 0 ? 'text-amber-500' : isDark ? 'text-white' : 'text-slate-800'}`}>
                                            {ticket.formatted_number}
                                        </span>
                                        <span className={`text-[9px] font-bold block truncate uppercase mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {(ticket.attendee_name || 'Cidadão').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[8px] font-black uppercase ${isDark ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-100/80 border-slate-200/60 text-slate-500'}`}>
                                        <UserTypeIcon userType={ticket.user_type} />
                                        {ticket.user_type.replace('servidor_ativo', 'Servidor')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                <p className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Nenhuma senha aguardando.</p>
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            {/* Rodapé: Histórico + News Ticker */}
            <section className="flex flex-col gap-3.5 z-10 relative flex-shrink-0">
                {/* Últimos atendimentos */}
                {historyTickets.length > 0 && (
                    <div className={`history-section border rounded-3xl p-3.5 backdrop-blur-md ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-slate-200/60 bg-white/55 shadow-sm'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <History sx={{ fontSize: 15 }} className={isDark ? 'text-blue-400' : 'text-[#204FA1]'} />
                            <h3 className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Últimos Atendimentos</h3>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-0.5 scrollbar-none">
                            {historyTickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    className={`flex-shrink-0 border rounded-2xl px-4 py-2 min-w-[170px] ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-white/60 border-slate-200/60'}`}
                                >
                                    <div className="flex justify-between items-center gap-2">
                                        <span className={`font-montserrat font-black text-sm tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{ticket.formatted_number}</span>
                                        <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Atendido</span>
                                    </div>
                                    <p className={`text-[9px] font-bold truncate mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{(ticket.attendee_name || 'Cidadão').toUpperCase()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* News Ticker Letreiro de Notícias */}
                <div className={`ticker-container w-full border rounded-2xl py-3 px-4 overflow-hidden relative flex items-center gap-4 shadow-lg ${isDark ? 'bg-[#204FA1] border-blue-700/30' : 'bg-[#1a3f85] border-blue-800/40'}`}>
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shrink-0 z-10 shadow-sm">
                        Informativo
                    </span>
                    <div className="relative flex-grow overflow-hidden whitespace-nowrap mask-gradient w-full">
                        <div className="gpu-ticker text-xs font-bold text-white tracking-wide">
                            {fullTickerText} &nbsp;&nbsp;•&nbsp;&nbsp; {fullTickerText} &nbsp;&nbsp;•&nbsp;&nbsp; {fullTickerText}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* FULL-SCREEN TAKEOVER OVERLAY: Ativado quando nova senha chama */}
            {/* ============================================================ */}
            {activeTakeoverTicket && (
                <div className={`fixed inset-0 z-[999] flex flex-col justify-between p-8 sm:p-14 animate-fade-in transition-all duration-300 ${isDark ? 'bg-slate-950/95' : 'bg-white/97'}`}>
                    {/* Accent background light */}
                    <div className={`absolute inset-0 bg-gradient-to-b pointer-events-none ${isDark ? 'from-[#204FA1]/10 via-transparent to-transparent' : 'from-blue-50/80 via-transparent to-transparent'}`}></div>

                    {/* Logo & header */}
                    <div className={`flex justify-between items-center z-10 border-b pb-4 ${isDark ? 'border-white/10' : 'border-slate-200/60'}`}>
                        <JaboataoPrevLogo dark={isDark} />
                        <div className="text-right">
                            <p className="text-xs uppercase font-black tracking-widest text-amber-500">Nova Senha Chamada</p>
                            <p className={`text-sm font-bold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dirija-se ao atendimento</p>
                        </div>
                    </div>

                    {/* Giant number display */}
                    <div className="my-auto flex flex-col items-center justify-center text-center z-10 space-y-4 max-h-[75vh]">
                        {/* Guichê / Atendente Badge */}
                        <div className="takeover-guiche px-6 py-2 bg-gradient-to-r from-jaboatao-blue to-[#2B6CB0] rounded-full border border-blue-400/30 text-white text-base sm:text-xl font-black uppercase tracking-widest shadow-2xl animate-bounce">
                            {getAtendenteOrGuiche(activeTakeoverTicket)}
                        </div>

                        {/* Number */}
                        <div className={`takeover-glow border rounded-[30px] px-8 py-4 sm:px-14 sm:py-6 max-w-3xl w-full flex items-center justify-center animate-pulse ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50/80 border-slate-200/60 shadow-inner shadow-slate-100'}`}>
                            <h1 className="font-montserrat font-black text-[12vw] md:text-[15vh] lg:text-[18vh] text-emerald-500 tracking-tighter leading-none select-none whitespace-nowrap">
                                {activeTakeoverTicket.formatted_number}
                            </h1>
                        </div>

                        {/* Attendee Name */}
                        <h2 className={`takeover-title text-3xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase truncate max-w-4xl px-4 mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {(activeTakeoverTicket.attendee_name || 'Cidadão').toUpperCase()}
                        </h2>

                        {/* Service Name */}
                        {activeTakeoverTicket.service?.name && (
                            <p className={`takeover-service text-lg sm:text-2xl font-bold tracking-wide mt-1 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                                {activeTakeoverTicket.service.name}
                            </p>
                        )}
                    </div>

                    {/* Footer sound label */}
                    <div className={`flex justify-center items-center gap-2 z-10 text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <VolumeUp className="text-emerald-500 animate-ping" />
                        Chamada Sonora Ativa
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicDisplayScreen;
