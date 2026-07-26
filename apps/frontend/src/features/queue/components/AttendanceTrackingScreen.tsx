import React, { useState, useEffect, useMemo } from 'react';
import { useTodayQueue } from '@features/queue/contexts/TodayQueueContext';
import { oldTicketNotificationManager } from '@shared/services/OldTicketNotificationManager';
import ConfirmationModal from './ConfirmationModal';
import OuvidoriaClassificationModal from './OuvidoriaClassificationModal';
import { useAuth } from '@features/auth/contexts/AuthContext';
import type { Ticket, TicketStatus } from '@shared/types';
import { 
    Play, 
    Volume2, 
    CheckCircle2, 
    XCircle, 
    UserX, 
    Clock, 
    User, 
    RefreshCw, 
    AlertTriangle, 
    Search, 
    Sparkles, 
    Shield, 
    History,
    ChevronRight,
    Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="fixed bottom-6 right-6 bg-slate-900/95 backdrop-blur-md text-white py-3.5 px-6 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3.5 z-[100] animate-fade-in-up text-sm font-semibold">
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
    const [classificationModal, setClassificationModal] = useState({ isOpen: false, ticketId: '' });
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
        const ticket = todayTickets.find(t => t.id === ticketId);
        if (status === 'completed' && ticket?.service?.is_ouvidoria) {
            setClassificationModal({ isOpen: true, ticketId });
        } else {
            setConfirmModal({ isOpen: true, ticketId, status });
        }
    };

    const handleConfirmClassification = async (classification: 'informacao' | 'reclamacao' | 'elogio') => {
        if (!classificationModal.ticketId) return;

        setIsUpdating(true);
        try {
            await updateTicketStatus(
                classificationModal.ticketId,
                'completed',
                'Atendimento finalizado com classificação',
                classification
            );
            
            await refreshTodayTickets();
            showToast('Atendimento finalizado e classificado com sucesso!');
            setLastUpdated(new Date());
            setClassificationModal({ isOpen: false, ticketId: '' });
        } catch (error) {
            console.error('Erro ao finalizar e classificar ticket:', error);
            showToast('Erro ao finalizar atendimento de Ouvidoria');
        } finally {
            setIsUpdating(false);
        }
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
        <div className="flex flex-col h-full gap-6 w-full text-slate-100 pb-8">
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
            
            <OuvidoriaClassificationModal
                isOpen={classificationModal.isOpen}
                onConfirm={handleConfirmClassification}
                onCancel={() => setClassificationModal({ isOpen: false, ticketId: '' })}
                isLoading={isUpdating}
            />
            
            {/* Header com Status e Refresh */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
                <div>
                    <h1 className="font-montserrat text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Cockpit de Atendimento
                    </h1>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                        Controle e gestão da fila de guichês em tempo real.
                    </p>
                </div>
                <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-bold text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        Fila Live
                    </span>
                    <button 
                        onClick={handleManualRefresh} 
                        className="flex items-center gap-2 py-2 px-4 text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl active:scale-95 transition-all duration-200"
                    >
                        <RefreshCw size={14} />
                        Sincronizar
                    </button>
                </div>
            </header>

            {/* Alertas de Senhas com muito tempo de espera */}
            {oldTicketAlerts.length > 0 && (
                <div className="space-y-3">
                    {oldTicketAlerts.map(alert => {
                        const isCritical = alert.level === 'critical';
                        const alertStyles = isCritical 
                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-200 shadow-rose-950/20' 
                            : 'border-amber-500/40 bg-amber-500/10 text-amber-200 shadow-amber-950/20';
                        
                        return (
                            <div
                                key={alert.ticket.id}
                                className={`p-4 rounded-2xl border ${alertStyles} text-xs font-bold flex items-center justify-between shadow-lg animate-pulse`}
                            >
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={18} className={isCritical ? 'text-rose-400' : 'text-amber-400'} />
                                    <span>
                                        Tempo Limite Excedido: Senha <span className="font-mono bg-white/10 px-2 py-0.5 rounded border border-white/20 font-black text-amber-300">{alert.ticket.formatted_number}</span> 
                                        está aguardando há <span className="underline">{alert.waitingMinutes} minutos</span> no serviço {alert.ticket.service?.name}.
                                    </span>
                                </div>
                                <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 bg-black/20 rounded-lg font-bold shrink-0 text-amber-400 border border-amber-400/20">
                                    Atenção Prioritária
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ZONA 1: Terminal Ativo (HUD de Atendimento do Operador) */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 text-white shadow-2xl p-6 sm:p-8">
                {/* Visual Accent Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {myCurrentTicket ? (
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                            <div className="p-5 bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border border-amber-500/30 rounded-2xl text-amber-400 shadow-xl">
                                <User size={42} />
                            </div>
                            <div className="space-y-2">
                                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-amber-400 text-slate-950 shadow-md">
                                    <Sparkles size={12} />
                                    Em Atendimento no Seu Terminal
                                </span>
                                <h2 className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-md">
                                    {myCurrentTicket.formatted_number}
                                </h2>
                                <p className="text-sm font-bold text-slate-300 flex items-center gap-2 justify-center sm:justify-start">
                                    <span>{myCurrentTicket.service?.name}</span>
                                    {myCurrentTicket.is_priority && (
                                        <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-[10px] uppercase font-bold">Preferencial</span>
                                    )}
                                </p>
                                {myCurrentTicket.attendee_name && (
                                    <p className="text-xs font-bold text-slate-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl uppercase w-fit mx-auto sm:mx-0">
                                        Beneficiário: {myCurrentTicket.attendee_name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Botões do Cockpit */}
                        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full lg:w-auto">
                            <button
                                onClick={() => recallTicket(myCurrentTicket.id)}
                                className="flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl text-white font-bold text-sm transition-all active:scale-95 shadow-lg"
                            >
                                <Volume2 size={18} className="text-amber-400" />
                                <span>Rechamar</span>
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(myCurrentTicket.id, 'completed')}
                                className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-slate-950 font-black text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                            >
                                <CheckCircle2 size={18} />
                                <span>Finalizar</span>
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(myCurrentTicket.id, 'no_show')}
                                className="flex items-center justify-center gap-2 px-5 py-4 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-2xl text-rose-300 font-bold text-sm transition-all active:scale-95"
                            >
                                <UserX size={18} />
                                <span>Ausente</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 py-4">
                        <div className="text-center sm:text-left space-y-1">
                            <h2 className="text-2xl font-black text-white">Nenhum Atendimento Ativo no Seu Guichê</h2>
                            <p className="text-xs text-slate-400">Clique abaixo para chamar a próxima senha da fila respeitando as prioridades.</p>
                        </div>
                        {waitingTickets.length > 0 ? (
                            <button
                                onClick={() => handleUpdateStatus(waitingTickets[0].id, 'in_progress')}
                                className="flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-jaboatao-yellow to-amber-500 text-slate-950 rounded-2xl font-black text-base shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all w-full sm:w-auto"
                            >
                                <Play size={20} />
                                <span>Chamar Próxima Senha ({waitingTickets[0].formatted_number})</span>
                            </button>
                        ) : (
                            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 text-xs font-bold">
                                Fila de Espera Vazia
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* ZONA 2: Fila de Espera & Senhas em Atendimento em Outros Guichês */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fila de Espera (2 cols) */}
                <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-6 flex flex-col">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                        <div className="flex items-center gap-2.5">
                            <Clock size={18} className="text-amber-400" />
                            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                                Senhas Aguardando na Fila ({waitingTickets.length})
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-96 pr-1">
                        <AnimatePresence>
                            {waitingTickets.length > 0 ? (
                                waitingTickets.map((ticket, idx) => (
                                    <motion.div
                                        key={ticket.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 hover:border-white/20 rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="w-7 h-7 rounded-xl bg-white/5 text-slate-400 font-bold text-xs flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-black text-lg text-white group-hover:text-amber-400 transition-colors">
                                                        {ticket.formatted_number}
                                                    </span>
                                                    {ticket.is_priority && (
                                                        <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-[9px] font-bold uppercase tracking-wider">
                                                            Preferencial
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                    {ticket.service?.name} {ticket.attendee_name && `• ${ticket.attendee_name}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                                                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                                            >
                                                <span>Chamar</span>
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-500 text-xs font-medium">
                                    Nenhuma senha aguardando no momento.
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Em Atendimento por Outros Operadores (1 col) */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-6 flex flex-col">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-white/10 mb-4">
                        <User size={18} className="text-blue-400" />
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                            Outros Guichês Ativos ({otherActiveTickets.length})
                        </h3>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-96 pr-1">
                        {otherActiveTickets.length > 0 ? (
                            otherActiveTickets.map(ticket => (
                                <div key={ticket.id} className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <span className="font-mono font-bold text-sm text-blue-400">{ticket.formatted_number}</span>
                                        <p className="text-[11px] text-slate-400">{ticket.operator?.name || 'Operador'}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[9px] font-bold uppercase">
                                        Em Curso
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-500 text-xs font-medium">
                                Nenhum outro guichê em atendimento.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ZONA 3: Histórico de Senhas do Dia */}
            <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <History size={18} className="text-amber-400" />
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                            Histórico de Atendimentos Recentes
                        </h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {historyTickets.length > 0 ? (
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-950/40">
                                    <th className="px-6 py-4">Senha</th>
                                    <th className="px-6 py-4">Serviço</th>
                                    <th className="px-6 py-4">Operador</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-medium text-slate-200">
                                {historyTickets.slice(0, 10).map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-3.5 font-mono font-bold text-white">{ticket.formatted_number}</td>
                                        <td className="px-6 py-3.5 text-slate-300">{ticket.service?.name || '—'}</td>
                                        <td className="px-6 py-3.5 text-slate-400">{ticket.operator?.name || '—'}</td>
                                        <td className="px-6 py-3.5">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase border ${
                                                ticket.status === 'completed'
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                    : ticket.status === 'no_show'
                                                        ? 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                            }`}>
                                                {ticket.status === 'completed' ? 'Finalizada' : ticket.status === 'no_show' ? 'Ausente' : 'Cancelada'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12 text-slate-500 text-xs font-medium">
                            Nenhum histórico registrado hoje.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceTrackingScreen;
