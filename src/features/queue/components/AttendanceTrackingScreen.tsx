
import React, { useState, useEffect, useMemo } from 'react';
import { useTodayQueue } from '@features/queue/contexts/TodayQueueContext';
import { oldTicketNotificationManager } from '@shared/services/OldTicketNotificationManager';
import ConfirmationModal from './ConfirmationModal';
import type { Ticket, TicketStatus } from '@shared/types';

const RefreshIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>;

const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; text: string; }> = {
    waiting: { label: 'Aguardando', bg: 'bg-slate-200', text: 'text-slate-800' },
    in_progress: { label: 'Em Atendimento', bg: 'bg-jaboatao-blue', text: 'text-white' },
    completed: { label: 'Finalizado', bg: 'bg-jaboatao-green-prev', text: 'text-white' },
    cancelled: { label: 'Cancelado', bg: 'bg-red-500', text: 'text-white' },
    no_show: { label: 'Não Compareceu', bg: 'bg-jaboatao-orange', text: 'text-white' },
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
        <div className="fixed bottom-5 right-5 bg-jaboatao-green-prev text-white py-3 px-6 rounded-lg shadow-xl animate-fade-in-up">
            {message}
        </div>
    );
};

const AttendanceTrackingScreen: React.FC = () => {
    const { todayTickets, updateTicketStatus, refreshTodayTickets } = useTodayQueue();
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [toast, setToast] = useState({ show: false, message: '' });
    const [oldTicketAlerts, setOldTicketAlerts] = useState<ReturnType<typeof oldTicketNotificationManager.getOldTicketAlerts>>([]);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, ticketId: '', status: null as TicketStatus | null });
    const [isUpdating, setIsUpdating] = useState(false);

    // Buscar dados da senha selecionada
    const selectedTicket = todayTickets.find(t => t.id === confirmModal.ticketId);

    useEffect(() => {
        // Auto-refresh a cada 30 segundos
        const timer = setInterval(() => {
            setLastUpdated(new Date());
            // Atualiza alertas de senhas velhas
            const alerts = oldTicketNotificationManager.getOldTicketAlerts(todayTickets);
            setOldTicketAlerts(alerts);
        }, 30000);
        return () => clearInterval(timer);
    }, [todayTickets]);

    const showToast = (message: string) => {
        setToast({ show: true, message });
    };

    const handleUpdateStatus = (ticketId: string, status: TicketStatus) => {
        // Abrir modal de confirmação
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
            
            // Refetch data após ação para refletir mudanças em tempo real
            await refreshTodayTickets();
            
            const statusLabel = STATUS_CONFIG[confirmModal.status].label;
            showToast(`Senha atualizada para "${statusLabel}"!`);
            setLastUpdated(new Date());
            
            // Fechar modal
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
        showToast('Dados atualizados!');
    };

    const sortedTickets = useMemo(() => {
        return [...todayTickets].sort((a, b) => {
             const statusOrder = (status: TicketStatus) => {
                switch(status) {
                    case 'in_progress': return 1;
                    case 'waiting': return 2;
                    default: return 3;
                }
            };
            if (statusOrder(a.status) !== statusOrder(b.status)) {
                return statusOrder(a.status) - statusOrder(b.status);
            }
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
    }, [todayTickets]);


    return (
        <div className="fade-in">
            <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} />
            
            {/* Modal de Confirmação */}
            {selectedTicket && confirmModal.status && (
                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    title={`Confirmar Ação`}
                    message={`Tem certeza que deseja alterar a senha ${selectedTicket.formatted_number} para "${STATUS_CONFIG[confirmModal.status].label}"?`}
                    confirmText="Confirmar"
                    cancelText="Cancelar"
                    isDangerous={['cancelled', 'no_show'].includes(confirmModal.status)}
                    onConfirm={handleConfirmUpdate}
                    onCancel={() => setConfirmModal({ isOpen: false, ticketId: '', status: null })}
                    isLoading={isUpdating}
                />
            )}
            
            <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="font-montserrat text-3xl font-semibold text-text-primary">Acompanhamento de Senhas</h1>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-text-secondary">
                        Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
                    </span>
                    <button onClick={handleManualRefresh} className="flex items-center gap-2 py-2 px-3 text-sm font-semibold text-jaboatao-blue bg-white border border-border-color rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                        <RefreshIcon />
                        Atualizar
                    </button>
                </div>
            </header>

            {/* Alertas de Senhas Velhas */}
            {oldTicketAlerts.length > 0 && (
                <div className="mb-6 space-y-2">
                    {oldTicketAlerts.map(alert => (
                        <div
                            key={alert.ticket.id}
                            className="p-3 rounded-lg border-l-4 text-white text-sm font-semibold flex items-center gap-2"
                            style={{
                                backgroundColor: oldTicketNotificationManager.getAlertColor(alert.level),
                                borderLeftColor: alert.level === 'critical' ? '#8b0000' : alert.level === 'danger' ? '#d32f2f' : '#f57c00',
                                opacity: 0.95,
                            }}
                        >
                            <span>{oldTicketNotificationManager.getAlertIcon(alert.level)}</span>
                            <span>{alert.message} ({alert.waitingMinutes} minutos)</span>
                        </div>
                    ))}
                </div>
            )}

            <main className="bg-white p-6 rounded-xl shadow-lg border border-border-color">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="border-b-2 border-border-color">
                            <tr>
                                <th className="p-3 font-semibold text-text-secondary">Senha</th>
                                <th className="p-3 font-semibold text-text-secondary">Usuário</th>
                                <th className="p-3 font-semibold text-text-secondary">Serviço</th>
                                <th className="p-3 font-semibold text-text-secondary text-center">Status</th>
                                <th className="p-3 font-semibold text-text-secondary text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTickets.length > 0 ? sortedTickets.map(ticket => {
                                const ticketAlert = oldTicketAlerts.find(a => a.ticket.id === ticket.id);
                                const alertColor = ticketAlert ? oldTicketNotificationManager.getAlertColor(ticketAlert.level) : 'transparent';
                                
                                return (
                                    <tr 
                                        key={ticket.id} 
                                        className="border-b border-border-color last:border-0 hover:bg-slate-50 transition-colors"
                                        style={{
                                            borderLeftWidth: ticketAlert ? '4px' : '0px',
                                            borderLeftColor: alertColor,
                                        }}
                                    >
                                        <td className="p-3 font-mono font-bold text-text-primary">{ticket.formatted_number}</td>
                                        <td className="p-3 capitalize">
                                            {ticket.user_type.replace('_', ' ')}
                                            {ticket.is_priority && (
                                                <span className="ml-2 px-2 py-0.5 text-xs font-bold text-jaboatao-orange bg-jaboatao-yellow/20 rounded-full">
                                                    PRIORITÁRIO
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-text-primary font-medium">{ticket.service?.name || 'N/A'}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${STATUS_CONFIG[ticket.status].bg} ${STATUS_CONFIG[ticket.status].text}`}>
                                                {STATUS_CONFIG[ticket.status].label}
                                            </span>
                                            {ticketAlert && (
                                                <div className="text-xs mt-1" style={{ color: alertColor }}>
                                                    {ticketAlert.waitingMinutes} min
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-center items-center gap-2">
                                                {ticket.status === 'waiting' && (
                                                    <button onClick={() => handleUpdateStatus(ticket.id, 'in_progress')} className="py-1 px-3 text-xs font-semibold text-white bg-jaboatao-blue rounded-md hover:opacity-80 transition-opacity">Iniciar Atendimento</button>
                                                )}
                                                {ticket.status === 'in_progress' && (
                                                     <button onClick={() => handleUpdateStatus(ticket.id, 'completed')} className="py-1 px-3 text-xs font-semibold text-white bg-jaboatao-green-prev rounded-md hover:opacity-80 transition-opacity">Finalizar</button>
                                                )}
                                                {(ticket.status === 'waiting' || ticket.status === 'in_progress') && (
                                                    <>
                                                        <button onClick={() => handleUpdateStatus(ticket.id, 'cancelled')} className="py-1 px-3 text-xs font-semibold text-white bg-red-500 rounded-md hover:opacity-80 transition-opacity">Cancelar</button>
                                                        {ticket.status === 'waiting' && <button onClick={() => handleUpdateStatus(ticket.id, 'no_show')} className="py-1 px-3 text-xs font-semibold text-white bg-jaboatao-orange rounded-md hover:opacity-80 transition-opacity">Não Compareceu</button>}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-text-secondary">Nenhuma senha no sistema.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AttendanceTrackingScreen;
