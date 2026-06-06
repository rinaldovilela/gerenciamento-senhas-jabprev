import React, { useState, useEffect, useMemo } from 'react';
import { useTodayQueue } from '@features/queue/contexts/TodayQueueContext';
import { oldTicketNotificationManager } from '@shared/services/OldTicketNotificationManager';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from '@features/auth/contexts/AuthContext';
import type { Ticket, TicketStatus } from '@shared/types';
import { 
    PlayArrow, 
    VolumeUp, 
    CheckCircle, 
    Cancel, 
    HourglassEmpty, 
    Refresh, 
    AccessTime, 
    Person, 
    Assignment,
    ChevronRight,
    Warning,
    History
} from '@mui/icons-material';

const STATUS_CONFIG: Record<TicketStatus, { label: string; badgeClass: string; icon: string }> = {
    waiting: { label: 'Aguardando', badgeClass: 'bg-blue-500/10 border border-blue-500/30 text-blue-400', icon: '⏳' },
    in_progress: { label: 'Em Curso', badgeClass: 'bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold', icon: '⚡' },
    completed: { label: 'Finalizado', badgeClass: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400', icon: '✅' },
    cancelled: { label: 'Cancelado', badgeClass: 'bg-rose-500/10 border border-rose-500/30 text-rose-400', icon: '❌' },
    no_show: { label: 'Ausente', badgeClass: 'bg-slate-500/10 border border-slate-500/30 text-slate-400', icon: '👤' },
};

const Toast: React.FC<{ message: string; show: boolean; onClose: () => void }> = ({ message, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="fixed bottom-6 right-6 bg-slate-950/95 backdrop-blur-md text-white py-3.5 px-6 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3.5 z-[100] animate-fade-in-up text-sm font-semibold">
            <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg">✓</span>
            <span>{message}</span>
        </div>
    );
};

const AttendanceTrackingScreen: React.FC = () => {
    const { user } = useAuth();
    const { todayTickets, updateTicketStatus, refreshTodayTickets, recallTicket } = useTodayQueue();
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [toast, setToast] = useState({ show: false, message: '' });
    const [oldTicketAlerts, setOldTicketAlerts] = useState<ReturnType<typeof oldTicketNotificationManager.getOldTicketAlerts>>([]);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, ticketId: '', status: null as TicketStatus | null });
    const [isUpdating, setIsUpdating] = useState(false);

    // Get ticket for confirmation modal
    const selectedTicket = todayTickets.find(t => t.id === confirmModal.ticketId);

    // Auto-refresh alerts and timestamp every 30s
    useEffect(() => {
        const timer = setInterval(() => {
            setLastUpdated(new Date());
            const alerts = oldTicketNotificationManager.getOldTicketAlerts(todayTickets);
            setOldTicketAlerts(alerts);
        }, 30000);
        return () => clearInterval(timer);
    }, [todayTickets]);

    // Initial alert load
    useEffect(() => {
        const alerts = oldTicketNotificationManager.getOldTicketAlerts(todayTickets);
        setOldTicketAlerts(alerts);
    }, [todayTickets]);

    const showToast = (message: string) => {
        setToast({ show: true, message });
    };

    const handleUpdateStatus = (ticketId: string, status: TicketStatus) => {
        setConfirmModal({ isOpen: true, ticketId, status });
    };

    const handleConfirmUpdate = async () => {
        if (!confirmModal.ticketId || !confirmModal.status) return;

        setIsUpdating(true);
        try {
            await updateTicketStatus(
                confirmModal.ticketId,
                confirmModal.status,
                `Alterado para ${STATUS_CONFIG[confirmModal.status].label}`
            );
            
            await refreshTodayTickets();
            const statusLabel = STATUS_CONFIG[confirmModal.status].label;
            showToast(`Senha atualizada para "${statusLabel}"!`);
            setLastUpdated(new Date());
            setConfirmModal({ isOpen: false, ticketId: '', status: null });
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            showToast('Erro ao atualizar status da senha');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleManualRefresh = async () => {
        await refreshTodayTickets();
        setLastUpdated(new Date());
        showToast('Fila de atendimento sincronizada!');
    };

    // Filter tickets based on user permissions
    const visibleTickets = useMemo(() => {
        const allowedIds = user?.serviceIds || [];
        return user?.role === 'admin' 
            ? todayTickets 
            : todayTickets.filter(t => allowedIds.includes(t.service_id));
    }, [todayTickets, user]);

    // Operator's currently active ticket (status = in_progress, assigned to this operator)
    const myCurrentTicket = useMemo(() => {
        return todayTickets.find(t => t.status === 'in_progress' && t.operator_id === user?.id);
    }, [todayTickets, user]);

    // Waiting tickets sorted by priority and date
    const waitingTickets = useMemo(() => {
        return visibleTickets
            .filter(t => t.status === 'waiting')
            .sort((a, b) => {
                if (a.is_priority !== b.is_priority) {
                    return a.is_priority ? -1 : 1;
                }
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            });
    }, [visibleTickets]);

    // Active tickets currently served by other operators
    const otherActiveTickets = useMemo(() => {
        return todayTickets.filter(t => t.status === 'in_progress' && t.operator_id !== user?.id);
    }, [todayTickets, user]);

    // Resolved history (completed, cancelled, no-show)
    const historyTickets = useMemo(() => {
        return visibleTickets
            .filter(t => ['completed', 'cancelled', 'no_show'].includes(t.status))
            .sort((a, b) => {
                const dateA = a.completed_at || a.created_at;
                const dateB = b.completed_at || b.created_at;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
    }, [visibleTickets]);

    return (
        <div className="flex flex-col h-full gap-6 w-full text-slate-800">
            <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} />
            
            {selectedTicket && confirmModal.status && (
                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    title="Confirmar Ação"
                    message={`Tem certeza que deseja alterar o status da senha ${selectedTicket.formatted_number} para "${STATUS_CONFIG[confirmModal.status].label}"?`}
                    confirmText="Confirmar"
                    cancelText="Cancelar"
                    isDangerous={['cancelled', 'no_show'].includes(confirmModal.status)}
                    onConfirm={handleConfirmUpdate}
                    onCancel={() => setConfirmModal({ isOpen: false, ticketId: '', status: null })}
                    isLoading={isUpdating}
                />
            )}
            
            {/* Header com Status e Refresh */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 pb-5">
                <div>
                    <h1 className="font-montserrat text-3xl font-black text-slate-900 tracking-tight">
                        Cockpit de Atendimento
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-semibold">
                        Controle e gestão da fila de guichês em tempo real.
                    </p>
                </div>
                <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#204FA1]/10 border border-[#204FA1]/25 rounded-2xl text-xs font-extrabold text-[#204FA1]">
                        <span className="w-2 h-2 rounded-full bg-jaboatao-green-prev animate-ping"></span>
                        Fila Live
                    </span>
                    <button 
                        onClick={handleManualRefresh} 
                        className="flex items-center gap-2 py-2 px-5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all duration-200"
                    >
                        <Refresh sx={{ fontSize: 18 }} />
                        Sincronizar
                    </button>
                </div>
            </header>

            {/* Alertas de Senhas com muito tempo de espera */}
            {oldTicketAlerts.length > 0 && (
                <div className="space-y-3">
                    {oldTicketAlerts.map(alert => {
                        const isCritical = alert.level === 'critical';
                        const isDanger = alert.level === 'danger';
                        const alertStyles = isCritical 
                            ? 'border-red-300 bg-red-500/10 text-red-800 shadow-red-100/50' 
                            : isDanger 
                            ? 'border-orange-300 bg-orange-500/10 text-orange-800 shadow-orange-100/50' 
                            : 'border-amber-300 bg-amber-500/10 text-amber-800 shadow-amber-100/50';
                        
                        return (
                            <div
                                key={alert.ticket.id}
                                className={`p-4 rounded-2xl border-2 ${alertStyles} text-sm font-bold flex items-center justify-between shadow-sm animate-pulse`}
                            >
                                <div className="flex items-center gap-3">
                                    <Warning sx={{ fontSize: 20 }} className={isCritical ? 'text-red-600' : 'text-amber-600'} />
                                    <span>
                                        Tempo Limite Excedido: Senha <span className="font-mono bg-white/80 px-2 py-0.5 rounded-lg border border-black/10 mx-1 font-black text-slate-900">{alert.ticket.formatted_number}</span> 
                                        está aguardando há <span className="underline decoration-2">{alert.waitingMinutes} minutos</span> no serviço {alert.ticket.service?.name}.
                                    </span>
                                </div>
                                <span className="text-[10px] uppercase tracking-widest px-3 py-1 bg-black/5 rounded-lg font-black shrink-0">
                                    Atenção Prioritária
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ZONA 1: Terminal Ativo (HUD de Atendimento do Operador) */}
            <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-[#204FA1] via-[#1A428A] to-[#123066] text-white shadow-2xl p-6 sm:p-8">
                {/* Visual Glass Accent */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

                {myCurrentTicket ? (
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                            <div className="p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white shadow-xl shadow-slate-900/10">
                                <Person sx={{ fontSize: 48 }} />
                            </div>
                            <div className="space-y-2">
                                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#FFC000] text-slate-950 animate-pulse shadow-md">
                                    ⚡ Em Atendimento no Seu Terminal
                                </span>
                                <h2 className="text-6xl font-black font-mono tracking-tight text-white drop-shadow-md">
                                    {myCurrentTicket.formatted_number}
                                </h2>
                                <p className="text-base font-bold text-white/90 flex items-center gap-1.5 justify-center sm:justify-start">
                                    <Assignment sx={{ fontSize: 18 }} className="text-white/60" />
                                    {myCurrentTicket.service?.name}
                                </p>
                                {myCurrentTicket.attendee_name && (
                                    <p className="text-xs font-black text-slate-950 bg-white/90 px-3 py-1.5 rounded-xl uppercase w-fit mx-auto sm:mx-0 shadow-sm">
                                        Beneficiário: {myCurrentTicket.attendee_name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Botões do Cockpit */}
                        <div className="flex flex-wrap justify-center gap-3.5 w-full lg:w-auto">
                            <button
                                onClick={() => { recallTicket(myCurrentTicket.id); showToast('Chamando senha novamente!'); }}
                                className="flex items-center justify-center gap-2 py-3.5 px-6 text-xs font-black uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl shadow-lg active:scale-95 transition-all duration-150 flex-1 sm:flex-none"
                            >
                                <VolumeUp sx={{ fontSize: 18 }} />
                                Re-chamar
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(myCurrentTicket.id, 'completed')}
                                className="flex items-center justify-center gap-2 py-3.5 px-6 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-jaboatao-green-prev to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-lg shadow-emerald-950/20 active:scale-95 transition-all duration-150 flex-1 sm:flex-none"
                            >
                                <CheckCircle sx={{ fontSize: 18 }} />
                                Finalizar
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(myCurrentTicket.id, 'no_show')}
                                className="flex items-center justify-center gap-2 py-3.5 px-5 text-xs font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-jaboatao-yellow to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-xl shadow-lg shadow-amber-950/20 active:scale-95 transition-all duration-150 flex-1 sm:flex-none"
                            >
                                Ausente
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(myCurrentTicket.id, 'cancelled')}
                                className="flex items-center justify-center gap-2 py-3.5 px-5 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 rounded-xl shadow-lg active:scale-95 transition-all duration-150 flex-1 sm:flex-none"
                            >
                                <Cancel sx={{ fontSize: 18 }} />
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left py-4 relative z-10">
                        <div className="space-y-1.5">
                            <h3 className="text-xl font-extrabold text-white">Pronto para iniciar novos atendimentos</h3>
                            <p className="text-sm font-semibold text-white/70">Selecione e chame a próxima senha disponível na lista ao lado.</p>
                        </div>
                        <span className="px-4 py-2.5 bg-white/15 border border-white/20 text-white text-xs font-black uppercase rounded-2xl tracking-widest shadow-inner">
                            Aguardando Operador
                        </span>
                    </div>
                )}
            </section>

            {/* ZONA 2 & 3: Fila de Espera (Aguardando) vs Histórico */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-grow min-h-0">
                {/* Fila de Espera Principal */}
                <div className="flex-1 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-5 rounded-full bg-[#204FA1]"></span>
                            Fila de Senhas Aguardando
                            <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50">
                                {waitingTickets.length}
                            </span>
                        </h3>
                    </div>

                    <div className="flex-grow overflow-y-auto max-h-[600px] pr-2 space-y-3">
                        {waitingTickets.length > 0 ? (
                            waitingTickets.map((ticket) => {
                                const isOld = oldTicketAlerts.some(a => a.ticket.id === ticket.id);
                                const cardBorder = ticket.is_priority 
                                    ? 'border-rose-200 hover:border-rose-300 shadow-rose-500/5 bg-rose-50/10' 
                                    : 'border-slate-100 hover:border-slate-300 bg-white';
                                
                                return (
                                    <div 
                                        key={ticket.id}
                                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-2xl border-2 transition-all duration-250 hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] ${cardBorder}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`font-mono font-black text-lg px-4 py-2 rounded-xl shadow-sm border ${
                                                ticket.is_priority 
                                                    ? 'bg-rose-50 border-rose-100 text-rose-700' 
                                                    : 'bg-blue-50 border-blue-100 text-[#204FA1]'
                                            }`}>
                                                {ticket.formatted_number}
                                            </span>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                                        {ticket.user_type.replace('_', ' ')}
                                                    </span>
                                                    {ticket.is_priority && (
                                                        <span className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-[#FFC000]/15 border border-[#FFC000]/30 text-[#B7791F] rounded-lg uppercase">
                                                            Prioritário
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                    <Assignment sx={{ fontSize: 14 }} className="text-slate-400" />
                                                    {ticket.service?.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-5">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold ${isOld ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                                                <AccessTime sx={{ fontSize: 15 }} />
                                                {formatWaitingTime(ticket.created_at)}
                                            </span>
                                            
                                            <button
                                                onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                                                disabled={!!myCurrentTicket}
                                                className="flex items-center justify-center gap-1 py-2.5 px-5 text-xs font-black uppercase tracking-wider text-white bg-[#204FA1] hover:bg-[#1C4690] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed rounded-xl shadow-md active:scale-95 transition-all duration-150"
                                            >
                                                Chamar
                                                <ChevronRight sx={{ fontSize: 16 }} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                                <HourglassEmpty sx={{ fontSize: 40 }} className="text-slate-300" />
                                <p className="text-sm font-bold text-slate-400">Sem senhas pendentes na fila.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Histórico Recente e Guichês Ativos */}
                <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
                    {/* Guichês Ativos por Outros Operadores (se houver) */}
                    {otherActiveTickets.length > 0 && (
                        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-4 rounded-full bg-[#FFC000]"></span>
                                Operadores Ativos
                            </h4>
                            <div className="space-y-3">
                                {otherActiveTickets.map(ticket => (
                                    <div key={ticket.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 text-xs">
                                        <div className="min-w-0">
                                            <p className="font-mono font-black text-[#204FA1]">{ticket.formatted_number}</p>
                                            <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">{ticket.operator?.name || 'Operador'}</p>
                                        </div>
                                        <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 font-black rounded-lg text-[9px] uppercase tracking-wider">
                                            Em Curso
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Histórico Recente */}
                    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex-grow flex flex-col min-h-[300px]">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <History sx={{ fontSize: 16 }} className="text-[#2E8B57]" />
                            Histórico de Atendimentos
                        </h4>
                        
                        <div className="flex-grow overflow-y-auto max-h-[350px] space-y-3 pr-1">
                            {historyTickets.length > 0 ? (
                                historyTickets.slice(0, 10).map(ticket => (
                                    <div key={ticket.id} className="p-3 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors duration-150 bg-white/50">
                                        <div className="min-w-0">
                                            <span className="font-mono font-black text-sm text-slate-800">
                                                {ticket.formatted_number}
                                            </span>
                                            <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">
                                                {ticket.service?.name}
                                            </p>
                                        </div>
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[9px] font-black border uppercase tracking-wider ${STATUS_CONFIG[ticket.status].badgeClass}`}>
                                            {STATUS_CONFIG[ticket.status].label}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-400 py-12 font-bold text-xs">Nenhum atendimento finalizado hoje.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to calculate waiting time in minutes
function formatWaitingTime(createdAtStr: string): string {
    try {
        const diffMs = new Date().getTime() - new Date(createdAtStr).getTime();
        const diffMins = Math.max(0, Math.floor(diffMs / 60000));
        return `${diffMins} min`;
    } catch {
        return '—';
    }
}

export default AttendanceTrackingScreen;
