import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQueue } from '@features/queue/contexts/QueueContext';
import { TRANSLATIONS } from '@shared/constants';
import type { Language, Ticket, UserType } from '@shared/types';
import {
    LineChart,
    Line,
    BarChart as RechartsBarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDownload, TrendingUp, Schedule, PersonSearch, SignalCellularAlt } from '@mui/icons-material';
import Toast from '@shared/components/Toast';

const language: Language = 'pt';

interface FilterState {
    startDate: string;
    endDate: string;
    serviceId: string;
    operatorId: string;
    userType: 'all' | UserType;
    priorityType: 'all' | 'normal' | 'priority';
}

const KPICard: React.FC<{ 
    title: string; 
    value: string | number; 
    description?: string; 
    icon?: React.ReactNode; 
    trend?: 'up' | 'down' | 'neutral'; 
    trenValue?: string 
}> = ({
    title,
    value,
    description,
    icon,
    trend,
    trenValue,
}) => (
    <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between h-full group relative overflow-hidden">
        {/* Subtle accent border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-jaboatao-blue to-[#407BDE] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-jaboatao-blue transition-colors duration-200">{value}</h3>
                {description && <p className="text-xs font-semibold text-slate-500 mt-1.5">{description}</p>}
            </div>
            {icon && (
                <div className="p-3 bg-blue-500/10 border border-blue-100/30 text-jaboatao-blue rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                    {icon}
                </div>
            )}
        </div>
        {trenValue && (
            <div className={`flex items-center gap-1.5 mt-4 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border w-fit ${
                trend === 'up' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
                    : trend === 'down' 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' 
                        : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
            }`}>
                {trend === 'up' && <span>↑</span>}
                {trend === 'down' && <span>↓</span>}
                {trend === 'neutral' && <span>→</span>}
                <span>{trenValue}</span>
            </div>
        )}
    </div>
);

const MetricsDashboard: React.FC = () => {
    const { tickets: allTickets, services, fetchTicketsByDateRange } = useQueue();
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        show: false,
        message: '',
        type: 'info',
    });
    const exportRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    const defaultStartDate = format(subDays(today, 30), 'yyyy-MM-dd');
    const defaultEndDate = format(today, 'yyyy-MM-dd');

    const [filters, setFilters] = useState<FilterState>({
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        serviceId: 'all',
        operatorId: 'all',
        userType: 'all',
        priorityType: 'all',
    });

    useEffect(() => {
        const interval = setInterval(() => setLastUpdated(new Date()), 30000);
        const handleClickOutside = (event: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setExportDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const startDate = startOfDay(parseISO(filters.startDate));
                const endDate = endOfDay(parseISO(filters.endDate));
                await fetchTicketsByDateRange(startDate, endDate);
            } catch (error) {
                console.error("Erro ao buscar dados do dashboard:", error);
            }
        };

        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.startDate, filters.endDate]);

    const operators = useMemo(() => {
        const opsMap = new Map<string, { id: string; name: string }>();
        allTickets.forEach(ticket => {
            if (ticket.operator && ticket.operator_id) {
                opsMap.set(ticket.operator_id, { id: ticket.operator.id, name: ticket.operator.name });
            }
        });
        return Array.from(opsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [allTickets]);

    const filteredTickets = useMemo(() => {
        const startDate = startOfDay(parseISO(filters.startDate));
        const endDate = endOfDay(parseISO(filters.endDate));

        return allTickets.filter((ticket) => {
            const ticketDate = parseISO(ticket.created_at);

            if (ticketDate < startDate || ticketDate > endDate) return false;
            if (filters.serviceId !== 'all' && ticket.service_id !== filters.serviceId) return false;
            if (filters.operatorId !== 'all' && ticket.operator_id !== filters.operatorId) return false;
            if (filters.userType !== 'all' && ticket.user_type !== filters.userType) return false;
            if (filters.priorityType === 'normal' && ticket.is_priority) return false;
            if (filters.priorityType === 'priority' && !ticket.is_priority) return false;

            return true;
        });
    }, [allTickets, filters]);

    const metrics = useMemo(() => {
        const completed = filteredTickets.filter((t) => t.status === 'completed' && t.started_at && t.completed_at);
        const waiting = filteredTickets.filter((t) => t.status === 'waiting');
        const cancelled = filteredTickets.filter((t) => t.status === 'cancelled' || t.status === 'no_show');

        const waitTimes = completed
            .map((t) => (new Date(t.started_at!).getTime() - new Date(t.created_at).getTime()) / (1000 * 60))
            .filter((t) => t >= 0);

        const serviceTimes = completed
            .map((t) => (new Date(t.completed_at!).getTime() - new Date(t.started_at!).getTime()) / (1000 * 60))
            .filter((t) => t >= 0);

        const avgWaitTime = waitTimes.length > 0 ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length : 0;
        const avgServiceTime = serviceTimes.length > 0 ? serviceTimes.reduce((a, b) => a + b, 0) / serviceTimes.length : 0;
        const medianWaitTime = waitTimes.length > 0 ? waitTimes.sort((a, b) => a - b)[Math.floor(waitTimes.length / 2)] : 0;
        const attendanceRate = filteredTickets.length > 0 ? (completed.length / filteredTickets.length) * 100 : 0;
        const maxWaitTime = waitTimes.length > 0 ? Math.max(...waitTimes) : 0;

        return {
            total: filteredTickets.length,
            completed: completed.length,
            waiting: waiting.length,
            cancelled: cancelled.length,
            avgWaitTime: avgWaitTime.toFixed(1),
            avgServiceTime: avgServiceTime.toFixed(1),
            medianWaitTime: medianWaitTime.toFixed(1),
            attendanceRate: attendanceRate.toFixed(1),
            maxWaitTime: maxWaitTime.toFixed(1),
            priorityCount: filteredTickets.filter((t) => t.is_priority).length,
        };
    }, [filteredTickets]);

    const timeSeriesData = useMemo(() => {
        const dailyGroups = new Map<string, { date: string; esperas: number[]; atendimentos: number[]; completados: number; esperando: number; cancelados: number }>();
        const startDate = startOfDay(parseISO(filters.startDate));
        const endDate = endOfDay(parseISO(filters.endDate));

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = format(d, 'dd/MM');
            dailyGroups.set(dateStr, { date: dateStr, esperas: [], atendimentos: [], completados: 0, esperando: 0, cancelados: 0 });
        }

        filteredTickets.forEach((ticket) => {
            const dateStr = format(parseISO(ticket.created_at), 'dd/MM');
            if (dailyGroups.has(dateStr)) {
                const group = dailyGroups.get(dateStr)!;
                if (ticket.status === 'completed' && ticket.started_at && ticket.completed_at) {
                    group.completados += 1;
                    const wait = (new Date(ticket.started_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60);
                    const service = (new Date(ticket.completed_at).getTime() - new Date(ticket.started_at).getTime()) / (1000 * 60);
                    if (wait >= 0) group.esperas.push(wait);
                    if (service >= 0) group.atendimentos.push(service);
                } else if (ticket.status === 'waiting') {
                    group.esperando += 1;
                } else {
                    group.cancelados += 1;
                }
            }
        });

        return Array.from(dailyGroups.values()).map((g) => {
            const avgWait = g.esperas.length > 0 ? g.esperas.reduce((a, b) => a + b, 0) / g.esperas.length : 0;
            const avgService = g.atendimentos.length > 0 ? g.atendimentos.reduce((a, b) => a + b, 0) / g.atendimentos.length : 0;
            return {
                date: g.date,
                'Tempo Espera': parseFloat(avgWait.toFixed(1)),
                'Tempo Atendimento': parseFloat(avgService.toFixed(1)),
                completados: g.completados,
                esperando: g.esperando,
                cancelados: g.cancelados,
            };
        });
    }, [filteredTickets, filters]);

    const serviceDistribution = useMemo(() => {
        const distribution = new Map<string, number>();
        filteredTickets.forEach((t) => {
            const serviceName = t.service?.name || 'Não Informado';
            distribution.set(serviceName, (distribution.get(serviceName) || 0) + 1);
        });
        return Array.from(distribution.entries()).map(([name, value]) => ({ name, value }));
    }, [filteredTickets]);

    const userTypeDistribution = useMemo(() => {
        const distribution = new Map<string, number>();
        filteredTickets.forEach((t) => {
            const typeLabel = t.user_type === 'aposentado' ? 'Aposentado' : t.user_type === 'pensionista' ? 'Pensionista' : 'Servidor Ativo';
            distribution.set(typeLabel, (distribution.get(typeLabel) || 0) + 1);
        });
        const colorsMap: Record<string, string> = {
            'Aposentado': '#204FA1',
            'Pensionista': '#F59E0B',
            'Servidor Ativo': '#2E8B57',
        };
        return Array.from(distribution.entries()).map(([name, value]) => ({ name, value, fill: colorsMap[name] || '#10B981' }));
    }, [filteredTickets]);

    const exportPDF = useCallback(() => {
        try {
            const doc = new jsPDF();
            doc.setFont('helvetica', 'normal');
            doc.text('Relatório JaboatãoPrev - Métricas de Atendimento', 14, 15);
            doc.setFontSize(10);
            doc.text(`Período: ${format(parseISO(filters.startDate), 'dd/MM/yyyy')} a ${format(parseISO(filters.endDate), 'dd/MM/yyyy')}`, 14, 22);

            const tableRows = filteredTickets.map((t) => [
                t.formatted_number,
                t.service?.name || '—',
                t.operator?.name || '—',
                t.user_type.replace('_', ' ').toUpperCase(),
                t.is_priority ? 'Sim' : 'Não',
                t.status.toUpperCase(),
                format(parseISO(t.created_at), 'dd/MM/yyyy HH:mm'),
            ]);

            autoTable(doc, {
                head: [['Senha', 'Serviço', 'Operador', 'Vínculo', 'Prioridade', 'Status', 'Data/Hora']],
                body: tableRows,
                startY: 28,
            });

            doc.save(`relatorio_metricas_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            setToast({ show: true, message: 'Relatório PDF gerado com sucesso!', type: 'success' });
        } catch (e) {
            console.error('Erro export PDF:', e);
            setToast({ show: true, message: 'Não foi possível exportar para PDF.', type: 'error' });
        }
    }, [filteredTickets, filters]);

    const exportJSON = useCallback(() => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(filteredTickets, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `relatorio_metricas_${format(new Date(), 'yyyy-MM-dd')}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setToast({ show: true, message: 'Relatório JSON gerado com sucesso!', type: 'success' });
    }, [filteredTickets]);

    const exportCSV = useCallback(() => {
        const csvRows = [
            ['Senha', 'Servico', 'Operador', 'Vinculo', 'Prioridade', 'Status', 'Data Criacao'],
        ];

        filteredTickets.forEach((t) => {
            csvRows.push([
                t.formatted_number,
                t.service?.name || '',
                t.operator?.name || '',
                t.user_type,
                t.is_priority ? 'Sim' : 'Nao',
                t.status,
                t.created_at,
            ]);
        });

        const csvContent = csvRows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `relatorio_metricas_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        setToast({ show: true, message: 'Relatório CSV gerado com sucesso!', type: 'success' });
    }, [filteredTickets]);

    const COLORS = ['#204FA1', '#2E8B57', '#F59E0B', '#EF4444', '#10B981', '#06B6D4', '#EC4899', '#14B8A6'];

    return (
        <div ref={dashboardRef} className="space-y-8 max-w-[1600px] mx-auto w-full text-slate-800">
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            />
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-2 border-b border-slate-200/50">
                <div>
                    <h1 className="font-montserrat text-3xl font-black text-slate-900 tracking-tight">
                        Painel de Métricas
                    </h1>
                    <p className="text-slate-500 text-sm font-semibold mt-1">Análise inteligente de performance, tempo de fila e atendimentos.</p>
                </div>

                <div className="relative self-stretch sm:self-auto" ref={exportRef}>
                    <button
                        onClick={() => setExportDropdownOpen((prev) => !prev)}
                        disabled={filteredTickets.length === 0}
                        className="flex items-center justify-center gap-2 py-3.5 px-6 text-xs font-black uppercase tracking-wider text-white bg-[#2E8B57] hover:bg-[#20623A] rounded-xl shadow-lg shadow-emerald-700/10 hover:shadow-xl active:scale-95 transition-all duration-200 w-full sm:w-auto disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        <FileDownload sx={{ fontSize: 20 }} />
                        Exportar Relatório
                    </button>
                    {exportDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl z-20 border border-slate-200/80 p-2 animate-fade-in-up">
                            <button onClick={exportPDF} className="flex items-center gap-3 w-full text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-150">
                                <span className="text-lg">📄</span> PDF
                            </button>
                            <button onClick={exportJSON} className="flex items-center gap-3 w-full text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-150">
                                <span className="text-lg">📋</span> JSON
                            </button>
                            <button onClick={exportCSV} className="flex items-center gap-3 w-full text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-150">
                                <span className="text-lg">📊</span> CSV
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <PersonSearch sx={{ fontSize: 22 }} className="text-jaboatao-blue" />
                    Filtros da Fila
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    <div>
                        <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-2">Data Inicial</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-2">Data Final</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-2">Serviço</label>
                        <select
                            value={filters.serviceId}
                            onChange={(e) => setFilters((f) => ({ ...f, serviceId: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200 cursor-pointer"
                        >
                            <option value="all">Todos os Serviços</option>
                            {services.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-2">Operador</label>
                        <select
                            value={filters.operatorId}
                            onChange={(e) => setFilters((f) => ({ ...f, operatorId: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200 cursor-pointer"
                        >
                            <option value="all">Todos os Operadores</option>
                            {operators.map((op) => (
                                <option key={op.id} value={op.id}>
                                    {op.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-2">Vínculo</label>
                        <select
                            value={filters.userType}
                            onChange={(e) => setFilters((f) => ({ ...f, userType: e.target.value as any }))}
                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200 cursor-pointer"
                        >
                            <option value="all">Todos os Vínculos</option>
                            <option value="aposentado">Aposentado</option>
                            <option value="pensionista">Pensionista</option>
                            <option value="servidor_ativo">Servidor Ativo</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-2">Fila</label>
                        <select
                            value={filters.priorityType}
                            onChange={(e) => setFilters((f) => ({ ...f, priorityType: e.target.value as any }))}
                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200 cursor-pointer"
                        >
                            <option value="all">Fila Geral</option>
                            <option value="normal">Normal</option>
                            <option value="priority">Prioritário</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* KPIs principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Total de Atendimentos" value={metrics.total} icon={<TrendingUp />} description="No período filtrado" />
                <KPICard title="Tempo Médio Espera" value={`${metrics.avgWaitTime} min`} icon={<Schedule />} description="Média até ser chamado" trend="up" trenValue={`${metrics.medianWaitTime} min (mediana)`} />
                <KPICard title="Tempo Médio Atendimento" value={`${metrics.avgServiceTime} min`} description="Tempo em guichê" trend="neutral" />
                <KPICard title="Taxa Finalização" value={`${metrics.attendanceRate}%`} description={`${metrics.completed} de ${metrics.total} atendimentos`} trend={Number(metrics.attendanceRate) > 80 ? 'up' : 'down'} />
                <KPICard title="Máximo Tempo Espera" value={`${metrics.maxWaitTime} min`} description="Maior fila registrada" />
                <KPICard title="Atendimentos Prioritários" value={metrics.priorityCount} description="Prioridade garantida" />
                <KPICard title="Aguardando" value={metrics.waiting} description="Senhas ativas na fila" />
                <KPICard title="Cancelados/Não Compareceram" value={metrics.cancelled} description={`${metrics.total > 0 ? ((metrics.cancelled / metrics.total) * 100).toFixed(1) : 0}% do total`} trend="down" />
            </div>

            {/* Gráficos Modernos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {timeSeriesData.length > 0 && (
                    <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Tendência de Tempos (Espera vs Atendimento)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} fontWeight={700} tickLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', fontFamily: 'Inter, sans-serif' }} />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                <Line type="monotone" dataKey="Tempo Espera" stroke="#204FA1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="Tempo Atendimento" stroke="#2E8B57" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {timeSeriesData.length > 0 && (
                    <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Volume de Atendimentos por Dia</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsBarChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} fontWeight={700} tickLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', fontFamily: 'Inter, sans-serif' }} />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                <Bar dataKey="completados" name="Completados" stackId="a" fill="#2E8B57" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="esperando" name="Aguardando" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cancelados" name="Cancelados" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {serviceDistribution.length > 0 && (
                    <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Distribuição por Serviço</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={serviceDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    innerRadius={45}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {serviceDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '16px', border: '1px solid #E2E8F0' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {userTypeDistribution.length > 0 && (
                    <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Distribuição por Tipo de Usuário</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userTypeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    innerRadius={45}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {userTypeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '16px', border: '1px solid #E2E8F0' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Tabela de últimos atendimentos */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-slate-200/50">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <SignalCellularAlt sx={{ fontSize: 20 }} className="text-jaboatao-blue" />
                        Histórico Geral de Senhas
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    {filteredTickets.length > 0 ? (
                        <table className="w-full border-collapse text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b border-slate-200/50 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                                    <th className="px-6 py-4">Senha</th>
                                    <th className="px-6 py-4">Serviço</th>
                                    <th className="px-6 py-4 hidden md:table-cell">Operador</th>
                                    <th className="px-6 py-4 hidden lg:table-cell">Vínculo</th>
                                    <th className="px-6 py-4 hidden sm:table-cell">Prioridade</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 hidden sm:table-cell">Data/Hora Emissão</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                                        <td className="px-6 py-4 font-mono font-black text-[#204FA1]">{ticket.formatted_number}</td>
                                        <td className="px-6 py-4">{ticket.service?.name || '—'}</td>
                                        <td className="px-6 py-4 hidden md:table-cell">{ticket.operator?.name || '—'}</td>
                                        <td className="px-6 py-4 uppercase text-[10px] font-black hidden lg:table-cell">{ticket.user_type.replace('_', ' ')}</td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            {ticket.is_priority ? (
                                                <span className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-wider">Sim</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-slate-100 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-wider">Não</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                                ticket.status === 'completed'
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                                                    : ticket.status === 'waiting'
                                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                                            }`}>
                                                {ticket.status === 'completed' ? 'Finalizada' : ticket.status === 'waiting' ? 'Aguardando' : ticket.status === 'no_show' ? 'Ausente' : 'Cancelada'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 font-normal hidden sm:table-cell">
                                            {format(parseISO(ticket.created_at), 'dd/MM/yyyy HH:mm')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-slate-400 py-20 font-bold text-sm">Nenhum atendimento finalizado para os filtros selecionados.</p>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 pt-6 border-t border-slate-200/50">
                <p>Última atualização automática: {format(lastUpdated, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</p>
                <p className="mt-1 text-slate-300">Período de Dados: {format(parseISO(filters.startDate), 'dd/MM/yyyy', { locale: ptBR })} a {format(parseISO(filters.endDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
            </footer>
        </div>
    );
};

export default MetricsDashboard;
