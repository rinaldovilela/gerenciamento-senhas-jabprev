
import React, { useState, useEffect, useMemo } from 'react';
import { useQueue } from '../contexts/QueueContext';
import { useAuth } from '../contexts/AuthContext';
import type { Ticket, TicketStatus } from '../types';

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
    const { tickets, updateTicketStatus } = useQueue();
    const { user } = useAuth();
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [toast, setToast] = useState({ show: false, message: '' });

    useEffect(() => {
        const timer = setInterval(() => setLastUpdated(new Date()), 10000); // Auto-refresh every 10s
        return () => clearInterval(timer);
    }, []);

    const showToast = (message: string) => {
        setToast({ show: true, message });
    };

    const handleUpdateStatus = (ticketId: string, status: TicketStatus) => {
        if (user) {
            updateTicketStatus(ticketId, status, user);
            const statusLabel = STATUS_CONFIG[status].label;
            showToast(`Senha atualizada para "${statusLabel}"!`);
        }
    };

    const sortedTickets = useMemo(() => {
        // Prioritize tickets in progress and waiting, then sort by date
        return [...tickets].sort((a, b) => {
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
            return a.createdAt.getTime() - b.createdAt.getTime();
        });
    }, [tickets, lastUpdated]);


    return (
        <div className="fade-in">
            <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} />
            <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="font-montserrat text-3xl font-semibold text-text-primary">Acompanhamento de Senhas</h1>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-text-secondary">
                        Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
                    </span>
                    <button onClick={() => setLastUpdated(new Date())} className="flex items-center gap-2 py-2 px-3 text-sm font-semibold text-jaboatao-blue bg-white border border-border-color rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                        <RefreshIcon />
                        Atualizar
                    </button>
                </div>
            </header>

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
                            {sortedTickets.length > 0 ? sortedTickets.map(ticket => (
                                <tr key={ticket.id} className="border-b border-border-color last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="p-3 font-mono font-bold text-text-primary">{ticket.formattedNumber}</td>
                                    <td className="p-3 capitalize">
                                        {ticket.userType.replace('_', ' ')}
                                        {ticket.isPriority && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-bold text-jaboatao-orange bg-jaboatao-yellow/20 rounded-full">
                                                PRIORITÁRIO
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-text-primary font-medium">{ticket.service.name}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${STATUS_CONFIG[ticket.status].bg} ${STATUS_CONFIG[ticket.status].text}`}>
                                            {STATUS_CONFIG[ticket.status].label}
                                        </span>
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
                            )) : (
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
