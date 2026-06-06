import React, { useState, useEffect, useMemo, useRef } from 'react';
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
        <div className={`p-2.5 rounded-xl border transition-all duration-300 ${dark ? 'bg-white/10 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
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
}

const PublicDisplayScreen: React.FC<PublicDisplayScreenProps> = ({ onBack }) => {
    const { todayTickets: tickets } = useTodayQueue();
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Controle do Takeover (Senha Chamada)
    const [activeTakeoverTicket, setActiveTakeoverTicket] = useState<Ticket | null>(null);
    const [lastCalledTicketId, setLastCalledTicketId] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Controle do Carrossel de Mídia
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const previousInProgressIds = useRef<Set<string>>(new Set());
    const spokenTicketIds = useRef<Set<string>>(new Set());

    // Refs de Controle Concorrente para Evitar Bugs de Modal e Sobreposição de Voz
    const activeTakeoverTicketRef = useRef<Ticket | null>(null);
    const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Limpeza de timers e referências de voz no desmonte do componente
    useEffect(() => {
        return () => {
            if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
            if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
            if (activeUtteranceRef.current) {
                activeUtteranceRef.current.onend = null;
                activeUtteranceRef.current.onerror = null;
            }
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Prefetch de vozes para navegadores modernos
    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            const handleVoicesChanged = () => {
                window.speechSynthesis.getVoices();
            };
            window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
            return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        }
    }, []);

    const speakTicket = (ticket: Ticket, onComplete: () => void) => {
        if ('speechSynthesis' in window) {
            // Cancelar falas anteriores e forçar liberação do mecanismo em navegadores baseados no Chromium
            window.speechSynthesis.cancel();
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }
            
            if (speechTimeoutRef.current) {
                clearTimeout(speechTimeoutRef.current);
            }
            
            speechTimeoutRef.current = setTimeout(() => {
                const ticketNumber = ticket.formatted_number;
                // Espaçar letras da senha para que o sintetizador soe de forma perfeitamente soletrada
                const formattedSpeechNumber = ticketNumber.replace('-', ' ').split('').join(' ');
                
                const attendeeName = ticket.attendee_name?.trim();
                const serviceName = ticket.service?.name || 'Atendimento Geral';
                const operatorName = ticket.operator?.name || null;
                const guicheText = getGuicheForTicket(ticket);

                let text = `Senha, número ${formattedSpeechNumber}.`;
                if (attendeeName) {
                    text += ` Solicitante, ${attendeeName}.`;
                }
                text += ` Assunto, ${serviceName}.`;
                if (operatorName) {
                    text += ` Atendimento com ${operatorName}.`;
                } else {
                    text += ` Dirija-se ao ${guicheText}.`;
                }

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'pt-BR';
                
                // Escolha da melhor voz em português (priorizando vozes femininas de alta fidelidade como Google/Microsoft)
                const voices = window.speechSynthesis.getVoices();
                const bestVoice = voices.find(v => v.lang.startsWith('pt') && 
                    (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural'))
                ) || voices.find(v => v.lang.startsWith('pt'));

                if (bestVoice) {
                    utterance.voice = bestVoice;
                }

                utterance.rate = 0.82; // Velocidade ligeiramente pausada para clareza e acessibilidade (idosos)
                utterance.pitch = 1.0;  // Tom de voz institucional natural
                utterance.volume = 1.0; // Volume máximo
                
                let hasFinished = false;
                const handleFinish = () => {
                    if (!hasFinished) {
                        hasFinished = true;
                        activeUtteranceRef.current = null;
                        onComplete();
                    }
                };

                utterance.onend = handleFinish;
                utterance.onerror = (e) => {
                    console.error('[Speech Error]', e);
                    handleFinish();
                };

                // Manter referência ativa para evitar que o Garbage Collector limpe o objeto no Chrome mid-speech
                activeUtteranceRef.current = utterance;

                window.speechSynthesis.speak(utterance);
            }, 800);
        } else {
            // Se não houver suporte a TTS, chama o callback imediatamente com um delay padrão
            if (speechTimeoutRef.current) {
                clearTimeout(speechTimeoutRef.current);
            }
            speechTimeoutRef.current = setTimeout(onComplete, 6000);
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

    // Fila de chamadas para evitar atropelo ou cancelamento quando atendentes chamam simultaneamente
    const callQueueRef = useRef<Ticket[]>([]);
    const isProcessingQueueRef = useRef<boolean>(false);

    const processNextInQueue = () => {
        if (isProcessingQueueRef.current || callQueueRef.current.length === 0) {
            return;
        }

        isProcessingQueueRef.current = true;
        const nextTicket = callQueueRef.current.shift();

        if (nextTicket) {
            setActiveTakeoverTicket(nextTicket);
            activeTakeoverTicketRef.current = nextTicket;
            setLastCalledTicketId(nextTicket.id);

            if (PANEL_CONFIG.mostrarSons && audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => console.error("Erro ao reproduzir áudio:", e));
            }

            if (safetyTimeoutRef.current) {
                clearTimeout(safetyTimeoutRef.current);
            }

            // Callback para quando a fala terminar ou o tempo de segurança estourar
            const handleSpeechEnded = () => {
                if (safetyTimeoutRef.current) {
                    clearTimeout(safetyTimeoutRef.current);
                }

                // Guard contra concorrência: só fecha se este callback pertence ao ticket ativo no takeover
                if (activeTakeoverTicketRef.current?.id !== nextTicket.id) {
                    console.log(`[Queue Control] Ignorando encerramento antigo para ticket ${nextTicket.formatted_number}`);
                    return;
                }

                setActiveTakeoverTicket(null);
                activeTakeoverTicketRef.current = null;
                setLastCalledTicketId(null);
                isProcessingQueueRef.current = false;

                // Pequeno intervalo de 500ms entre as chamadas para a voz/tela respirarem
                setTimeout(() => {
                    processNextInQueue();
                }, 500);
            };

            if (nextTicket.formatted_number) {
                // Fala a senha e avança para a próxima chamada somente após a conclusão da voz
                speakTicket(nextTicket, handleSpeechEnded);
            } else {
                // Se o ticket estiver incompleto, encerra após 6 segundos por segurança
                safetyTimeoutRef.current = setTimeout(handleSpeechEnded, 6000);
                return;
            }

            // Timeout de segurança máximo de 15 segundos para garantir que a fila nunca trave
            // caso o navegador bloqueie a fala ou o evento onend falhe em ser disparado
            safetyTimeoutRef.current = setTimeout(handleSpeechEnded, 15000);
        } else {
            isProcessingQueueRef.current = false;
        }
    };

    const enqueueTicket = (ticket: Ticket) => {
        if (callQueueRef.current.some(t => t.id === ticket.id)) return;
        callQueueRef.current.push(ticket);
        processNextInQueue();
    };

    // Canal Supabase (Recall Manual)
    useEffect(() => {
        const channel = supabase.channel('tickets-live-updates');
        channel.on('broadcast', { event: 'ticket_recall' }, (payload) => {
            const ticketId = payload.payload?.ticketId;
            if (ticketId) {
                const ticket = tickets.find(t => t.id === ticketId);
                if (ticket) {
                    enqueueTicket(ticket);
                }
            }
        }).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tickets]);

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

    // Combina os textos do News Ticker em uma única string
    const fullTickerText = useMemo(() => {
        return NEWS_TICKER_TEXTS.join("  •  ");
    }, []);

    return (
        <div 
            className="public-display-container flex flex-col w-full h-screen overflow-hidden p-4 sm:p-5 bg-cover bg-center bg-no-repeat relative text-white select-none"
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

            {/* Backdrop Blur + Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[8px] pointer-events-none z-0"></div>

            {/* Header */}
            <header className="flex justify-between items-center mb-4 z-10 relative border-b border-white/10 pb-3">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 shadow-sm active:scale-95 flex items-center justify-center"
                        aria-label="Voltar"
                    >
                        <ArrowBack sx={{ fontSize: 20, color: 'white' }} />
                    </button>
                    <JaboataoPrevLogo dark />
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2 justify-end">
                            <AccessTime sx={{ fontSize: 26 }} className="text-amber-400" />
                            {currentTime.toLocaleTimeString('pt-BR')}
                        </p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-0.5">
                            {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <button
                        onClick={toggleFullscreen}
                        className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 shadow-sm flex-shrink-0 active:scale-95 flex items-center justify-center"
                    >
                        {isFullscreen ? (
                            <FullscreenExit sx={{ fontSize: 22, color: 'white' }} />
                        ) : (
                            <Fullscreen sx={{ fontSize: 22, color: 'white' }} />
                        )}
                    </button>
                </div>
            </header>

            {/* Main Bento Grid */}
            <main className="public-display-main flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-5 z-10 relative mb-4">
                
                {/* COLUNA ESQUERDA (2/3): Atendimento Ativo & Slideshow */}
                <section className="lg:col-span-2 flex flex-col gap-5 min-h-0">
                    
                    {/* Slideshow Informativo JaboatãoPrev */}
                    <div className="slideshow-container flex-grow border border-white/10 bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-0">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        
                        {/* Slide Tag */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                                <Campaign sx={{ fontSize: 18 }} />
                                Informativo JaboatãoPrev
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                {INFO_SLIDES[currentSlideIndex].tag}
                            </span>
                        </div>

                        {/* Slide Content */}
                        <div className="slideshow-content my-auto py-4 flex flex-col sm:flex-row items-center gap-6 transition-all duration-500">
                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl shadow-inner shrink-0">
                                {INFO_SLIDES[currentSlideIndex].icon}
                            </div>
                            <div className="space-y-2.5 text-center sm:text-left">
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                                    {INFO_SLIDES[currentSlideIndex].title}
                                </h2>
                                <p className="slideshow-description text-sm sm:text-base font-semibold text-slate-300 leading-relaxed max-w-xl">
                                    {INFO_SLIDES[currentSlideIndex].description}
                                </p>
                            </div>
                        </div>

                        {/* Slide Dots */}
                        <div className="flex justify-center gap-2 border-t border-white/5 pt-3">
                            {INFO_SLIDES.map((slide, idx) => (
                                <button
                                    key={slide.id}
                                    onClick={() => setCurrentSlideIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        currentSlideIndex === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/20'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Senha em Atendimento Ativa (Abaixo da Mídia) */}
                    <div className="flex-shrink-0 border border-white/10 bg-slate-900/60 backdrop-blur-md rounded-3xl p-5 flex items-center justify-between gap-6 shadow-xl">
                        {mainInProgressTicket ? (
                            <>
                                <div className="min-w-0 flex items-center gap-5">
                                    <div className="w-14 h-14 bg-gradient-to-tr from-jaboatao-blue to-[#407BDE] text-white font-montserrat font-black rounded-2xl flex items-center justify-center text-xl shadow-md shadow-blue-950/20 shrink-0">
                                        {mainInProgressTicket.formatted_number.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Última Senha Chamada</p>
                                        <h3 className="font-montserrat font-black text-3xl text-white tracking-tighter mt-1">{mainInProgressTicket.formatted_number}</h3>
                                        <p className="text-xs font-bold text-slate-300 truncate mt-0.5">{(mainInProgressTicket.attendee_name || 'Cidadão').toUpperCase()}</p>
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
                            <p className="text-xs font-bold text-slate-400 text-center w-full py-4">Nenhuma senha ativa em atendimento.</p>
                        )}
                    </div>

                    {/* Secondary in-progress Tickets (Outros guichês) */}
                    {secondaryInProgressTickets.length > 0 && (
                        <div className="flex-shrink-0">
                            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Atendimentos Simultâneos</h3>
                            <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
                                {secondaryInProgressTickets.map(ticket => (
                                    <div
                                        key={ticket.id}
                                        className="flex-shrink-0 min-w-[220px] p-4 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md flex items-center justify-between gap-4"
                                    >
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{getAtendenteOrGuiche(ticket)}</p>
                                            <p className="font-montserrat font-black text-xl text-white tracking-tighter mt-0.5">{ticket.formatted_number}</p>
                                            <p className="text-[10px] font-bold text-slate-300 truncate max-w-[130px] mt-0.5">{(ticket.attendee_name || 'Cidadão').toUpperCase()}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase text-slate-400">
                                            {ticket.user_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* COLUNA DIREITA (1/3): Próximas Senhas na Fila */}
                <aside className="lg:col-span-1 border border-white/10 bg-slate-900/60 backdrop-blur-md rounded-3xl p-5 shadow-2xl flex flex-col h-full min-h-0">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-2 border-b border-white/10 pb-2.5">
                        <QueuePlayNext sx={{ fontSize: 16 }} className="text-amber-400" />
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
                                            : 'border-white/5 bg-slate-900/40'
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <span className={`font-montserrat font-black text-xl tracking-tighter ${idx === 0 ? 'text-amber-400' : 'text-white'}`}>
                                            {ticket.formatted_number}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 block truncate uppercase mt-0.5">
                                            {(ticket.attendee_name || 'Cidadão').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 px-2.5 py-1 bg-white/5 rounded-xl border border-white/5 text-[8px] font-black uppercase text-slate-300">
                                        <UserTypeIcon userType={ticket.user_type} />
                                        {ticket.user_type.replace('servidor_ativo', 'Servidor')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                <p className="text-xs font-bold text-slate-500">Nenhuma senha aguardando.</p>
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            {/* Rodapé: Histórico + News Ticker */}
            <section className="flex flex-col gap-3.5 z-10 relative flex-shrink-0">
                {/* Últimos atendimentos */}
                {historyTickets.length > 0 && (
                    <div className="history-section border border-white/10 bg-slate-900/40 backdrop-blur-md rounded-3xl p-3.5">
                        <div className="flex items-center gap-2 mb-2">
                            <History sx={{ fontSize: 15 }} className="text-blue-400" />
                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Últimos Atendimentos</h3>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-0.5 scrollbar-none">
                            {historyTickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    className="flex-shrink-0 bg-slate-950/40 border border-white/5 rounded-2xl px-4 py-2 min-w-[170px]"
                                >
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="font-montserrat font-black text-sm text-slate-200 tracking-tight">{ticket.formatted_number}</span>
                                        <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">Atendido</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 truncate mt-1">{(ticket.attendee_name || 'Cidadão').toUpperCase()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* News Ticker Letreiro de Notícias */}
                <div className="ticker-container w-full bg-[#204FA1] border border-blue-700/30 rounded-2xl py-3 px-4 overflow-hidden relative flex items-center gap-4 shadow-lg">
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
                <div className="fixed inset-0 bg-slate-950/95 z-[999] flex flex-col justify-between p-8 sm:p-14 animate-fade-in transition-all duration-300">
                    {/* Glowing Accent background light */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#204FA1]/10 via-transparent to-transparent pointer-events-none"></div>

                    {/* Logo & Clock header */}
                    <div className="flex justify-between items-center z-10 border-b border-white/10 pb-4">
                        <JaboataoPrevLogo dark />
                        <div className="text-right">
                            <p className="text-xs uppercase font-black tracking-widest text-amber-400">Nova Senha Chamada</p>
                            <p className="text-sm font-bold text-slate-400 mt-0.5">Dirija-se ao atendimento</p>
                        </div>
                    </div>

                    {/* Giant Box display */}
                    <div className="my-auto flex flex-col items-center justify-center text-center z-10 space-y-4 max-h-[75vh]">
                        {/* Guichê / Atendente Badge */}
                        <div className="takeover-guiche px-6 py-2 bg-gradient-to-r from-jaboatao-blue to-[#2B6CB0] rounded-full border border-blue-400/30 text-white text-base sm:text-xl font-black uppercase tracking-widest shadow-2xl animate-bounce">
                            {getAtendenteOrGuiche(activeTakeoverTicket)}
                        </div>

                        {/* Number Display */}
                        <div className="takeover-glow bg-white/5 border border-white/10 rounded-[30px] px-8 py-4 sm:px-14 sm:py-6 max-w-3xl w-full flex items-center justify-center animate-pulse">
                            <h1 className="font-montserrat font-black text-[12vw] md:text-[15vh] lg:text-[18vh] text-emerald-400 tracking-tighter leading-none select-none whitespace-nowrap">
                                {activeTakeoverTicket.formatted_number}
                            </h1>
                        </div>

                        {/* Attendee Name */}
                        <h2 className="takeover-title text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase truncate max-w-4xl px-4 mt-2">
                            {(activeTakeoverTicket.attendee_name || 'Cidadão').toUpperCase()}
                        </h2>

                        {/* Service Name */}
                        {activeTakeoverTicket.service?.name && (
                            <p className="takeover-service text-lg sm:text-2xl font-bold text-slate-300 tracking-wide mt-1">
                                {activeTakeoverTicket.service.name}
                            </p>
                        )}
                    </div>

                    {/* Ticker footer sound notification label */}
                    <div className="flex justify-center items-center gap-2 z-10 text-xs font-black uppercase tracking-widest text-slate-500">
                        <VolumeUp className="text-emerald-400 animate-ping" />
                        Chamada Sonora Ativa
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicDisplayScreen;
