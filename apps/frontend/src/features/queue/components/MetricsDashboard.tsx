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
import { FileDownload, TrendingUp, Schedule, PersonSearch } from '@mui/icons-material';
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

const KPICard: React.FC<{ title: string; value: string | number; description?: string; icon?: React.ReactNode; trend?: 'up' | 'down' | 'neutral'; trenValue?: string }> = ({
    title,
    value,
    description,
    icon,
    trend,
    trenValue,
}) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-border-color hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-text-primary">{value}</h3>
                {description && <p className="text-xs text-text-secondary mt-2">{description}</p>}
                {trenValue && (
                    <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                        {trend === 'up' && '↑'}
                        {trend === 'down' && '↓'}
                        {trend === 'neutral' && '→'}
                        {trenValue}
                    </div>
                )}
            </div>
            {icon && <div className="ml-4 text-jaboatao-blue">{icon}</div>}
        </div>
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
        const startDate = startOfDay(parseISO(filters.startDate));
        const endDate = endOfDay(parseISO(filters.endDate));

        void fetchTicketsByDateRange(startDate, endDate);
    }, [fetchTicketsByDateRange, filters.startDate, filters.endDate]);

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
        const dataByDay = new Map<string, { completed: number; waiting: number; cancelled: number; avgWait: number; avgService: number }>();

        filteredTickets.forEach((ticket) => {
            const day = format(parseISO(ticket.created_at), 'yyyy-MM-dd');
            if (!dataByDay.has(day))
                dataByDay.set(day, { completed: 0, waiting: 0, cancelled: 0, avgWait: 0, avgService: 0 });

            const dayData = dataByDay.get(day)!;

            if (ticket.status === 'completed') dayData.completed++;
            else if (ticket.status === 'waiting') dayData.waiting++;
            else if (ticket.status === 'cancelled' || ticket.status === 'no_show') dayData.cancelled++;

            if (ticket.status === 'completed' && ticket.started_at && ticket.completed_at) {
                const waitTime = (new Date(ticket.started_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60);
                const serviceTime = (new Date(ticket.completed_at).getTime() - new Date(ticket.started_at).getTime()) / (1000 * 60);
                dayData.avgWait += waitTime;
                dayData.avgService += serviceTime;
            }
        });

        const sortedDays = Array.from(dataByDay.keys()).sort();
        return sortedDays.map((day) => {
            const data = dataByDay.get(day)!;
            const completedCount = Math.max(data.completed, 1);
            return {
                date: format(parseISO(day), 'dd/MM', { locale: ptBR }),
                completados: data.completed,
                esperando: data.waiting,
                cancelados: data.cancelled,
                'Tempo Espera': Number((data.avgWait / completedCount).toFixed(1)),
                'Tempo Atendimento': Number((data.avgService / completedCount).toFixed(1)),
            };
        });
    }, [filteredTickets]);

    const serviceDistribution = useMemo(() => {
        const distribution = services
            .map((service) => ({
                name: service.name,
                value: filteredTickets.filter((t) => t.service_id === service.id).length,
            }))
            .filter((d) => d.value > 0)
            .sort((a, b) => b.value - a.value);

        return distribution.slice(0, 8);
    }, [filteredTickets, services]);

    const userTypeDistribution = useMemo(() => {
        const types = { aposentado: 0, pensionista: 0, servidor_ativo: 0 };
        filteredTickets.forEach((t) => {
            const type = t.user_type as 'aposentado' | 'pensionista' | 'servidor_ativo';
            if (type in types) types[type]++;
        });
        return [
            { name: 'Aposentado', value: types.aposentado, fill: '#204FA1' },
            { name: 'Pensionista', value: types.pensionista, fill: '#2E8B57' },
            { name: 'Servidor Ativo', value: types.servidor_ativo, fill: '#F59E0B' },
        ].filter((d) => d.value > 0);
    }, [filteredTickets]);

    const exportPDF = useCallback(() => {
        setExportDropdownOpen(false);

        try {
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();

            pdf.setFontSize(18);
            pdf.setTextColor(32, 79, 161); // Jaboatao Blue
            pdf.text('Relatório de Métricas - Jaboatão Prev', pageWidth / 2, 15, { align: 'center' });

            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Período: ${format(parseISO(filters.startDate), 'dd/MM/yyyy')} a ${format(parseISO(filters.endDate), 'dd/MM/yyyy')}`, pageWidth / 2, 22, { align: 'center' });
            pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, pageWidth / 2, 28, { align: 'center' });

            const statsBody = [
                ['Total Atendimentos', metrics.total.toString(), 'Tempo Médio Espera', `${metrics.avgWaitTime} min`],
                ['Finalizados', metrics.completed.toString(), 'Tempo Médio Atend.', `${metrics.avgServiceTime} min`],
                ['Cancelados/Não Compareceu', metrics.cancelled.toString(), 'Taxa Finalização', `${metrics.attendanceRate}%`],
            ];

            autoTable(pdf, {
                startY: 35,
                head: [['Métrica', 'Valor', 'Métrica', 'Valor']],
                body: statsBody,
                theme: 'grid',
                headStyles: { fillColor: [32, 79, 161], textColor: [255, 255, 255] },
                styles: { fontSize: 10, cellPadding: 3 },
            });

            // Adicionar detalhes dos últimos atendimentos (ou todos os filtrados)
            const headers = ['Senha', 'Tipo', 'Serviço', 'Operador', 'Status', 'T. Espera', 'T. Atend.', 'Data/Hora'];
            
            const rows = filteredTickets.map((t) => {
                const waitTime = t.started_at ? ((new Date(t.started_at).getTime() - new Date(t.created_at).getTime()) / 60000).toFixed(1) + ' min' : '—';
                const serviceTime = t.started_at && t.completed_at ? ((new Date(t.completed_at).getTime() - new Date(t.started_at).getTime()) / 60000).toFixed(1) + ' min' : '—';
                
                return [
                    t.formatted_number,
                    t.user_type,
                    t.service?.name || '—',
                    t.operator?.name || '—',
                    t.status === 'completed' ? 'Finalizado' : t.status === 'cancelled' ? 'Cancelado' : t.status === 'waiting' ? 'Aguardando' : t.status,
                    waitTime,
                    serviceTime,
                    format(parseISO(t.created_at), 'dd/MM/yyyy HH:mm')
                ];
            });

            const finalY = (pdf as any).lastAutoTable.finalY || 40;

            pdf.setFontSize(14);
            pdf.setTextColor(0, 0, 0);
            pdf.text('Detalhamento de Senhas', 14, finalY + 15);

            autoTable(pdf, {
                startY: finalY + 20,
                head: [headers],
                body: rows,
                theme: 'striped',
                headStyles: { fillColor: [46, 139, 87], textColor: [255, 255, 255] }, // Jaboatao Green
                styles: { fontSize: 8, cellPadding: 2 },
            });

            pdf.save(`relatorio_metricas_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.pdf`);
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            setToast({ show: true, message: 'Erro ao gerar relatorio PDF. Tente novamente.', type: 'error' });
        }
    }, [filteredTickets, filters, metrics]);

    const exportJSON = useCallback(() => {
        setExportDropdownOpen(false);
        const dataToExport = {
            periodo: { inicio: filters.startDate, fim: filters.endDate },
            metricas: metrics,
            tickets: filteredTickets,
            geradoEm: new Date().toISOString(),
        };

        const filename = `relatorio_metricas_${format(new Date(), 'yyyy-MM-dd')}`;
        const fileContent = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([fileContent], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `${filename}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }, [filteredTickets, filters, metrics]);

    const exportCSV = useCallback(() => {
        setExportDropdownOpen(false);
        const headers = ['Senha', 'Tipo Usuário', 'Prioritário', 'Serviço', 'Status', 'Data Criação', 'Tempo Espera (min)', 'Tempo Atendimento (min)'];
        const rows = filteredTickets.map((t) => {
            const waitTime = t.started_at ? ((new Date(t.started_at).getTime() - new Date(t.created_at).getTime()) / 60000).toFixed(2) : 'N/A';
            const serviceTime = t.started_at && t.completed_at ? ((new Date(t.completed_at).getTime() - new Date(t.started_at).getTime()) / 60000).toFixed(2) : 'N/A';

            return [
                t.formatted_number,
                t.user_type,
                t.is_priority ? 'Sim' : 'Não',
                t.service?.name || 'N/A',
                t.operator?.name || 'N/A',
                t.status,
                t.created_at,
                waitTime,
                serviceTime,
            ];
        });

        const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `relatorio_metricas_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }, [filteredTickets]);

    const COLORS = ['#204FA1', '#2E8B57', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6'];

    return (
        <div className="fade-in">
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            />
            <div ref={dashboardRef} className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="font-montserrat text-3xl md:text-4xl font-bold text-text-primary mb-2">Painel de Métricas</h1>
                        <p className="text-text-secondary text-sm">Análise completa de atendimentos e performance</p>
                    </div>

                    <div className="relative" ref={exportRef}>
                        <button
                            onClick={() => setExportDropdownOpen((prev) => !prev)}
                            disabled={filteredTickets.length === 0}
                            className="flex items-center gap-2 py-2 px-4 text-sm font-semibold text-white bg-jaboatao-green-prev rounded-lg shadow-md hover:bg-[#267347] transition-all duration-200 transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            <FileDownload sx={{ fontSize: 18 }} />
                            Exportar Relatório
                        </button>
                        {exportDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-border-color animate-fade-in-up">
                                <button onClick={exportPDF} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-slate-100">
                                    📄 Exportar como PDF
                                </button>
                                <button onClick={exportJSON} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-slate-100">
                                    📋 Exportar como JSON
                                </button>
                                <button onClick={exportCSV} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-slate-100">
                                    📊 Exportar como CSV
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-border-color">
                    <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <PersonSearch sx={{ fontSize: 20 }} className="text-jaboatao-blue" />
                        Filtros de Pesquisa
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div>
                            <label className="text-xs font-medium text-text-secondary block mb-2">Data Inicial</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                                className="w-full p-2 border border-border-color rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jaboatao-blue/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary block mb-2">Data Final</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                                className="w-full p-2 border border-border-color rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jaboatao-blue/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary block mb-2">Serviço</label>
                            <select
                                value={filters.serviceId}
                                onChange={(e) => setFilters((f) => ({ ...f, serviceId: e.target.value }))}
                                className="w-full p-2 border border-border-color rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jaboatao-blue/50"
                            >
                                <option value="all">Todos</option>
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary block mb-2">Operador</label>
                            <select
                                value={filters.operatorId}
                                onChange={(e) => setFilters((f) => ({ ...f, operatorId: e.target.value }))}
                                className="w-full p-2 border border-border-color rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jaboatao-blue/50"
                            >
                                <option value="all">Todos</option>
                                {operators.map((op) => (
                                    <option key={op.id} value={op.id}>
                                        {op.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary block mb-2">Tipo Usuário</label>
                            <select
                                value={filters.userType}
                                onChange={(e) => setFilters((f) => ({ ...f, userType: e.target.value as any }))}
                                className="w-full p-2 border border-border-color rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jaboatao-blue/50"
                            >
                                <option value="all">Todos</option>
                                <option value="aposentado">Aposentado</option>
                                <option value="pensionista">Pensionista</option>
                                <option value="servidor_ativo">Servidor Ativo</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary block mb-2">Tipo Atendimento</label>
                            <select
                                value={filters.priorityType}
                                onChange={(e) => setFilters((f) => ({ ...f, priorityType: e.target.value as any }))}
                                className="w-full p-2 border border-border-color rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jaboatao-blue/50"
                            >
                                <option value="all">Todos</option>
                                <option value="normal">Normal</option>
                                <option value="priority">Prioritário</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* KPIs principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard title="Total de Atendimentos" value={metrics.total} icon={<TrendingUp />} description="No período selecionado" />
                    <KPICard title="Tempo Médio Espera" value={`${metrics.avgWaitTime} min`} icon={<Schedule />} description="Até início do atendimento" trend="up" trenValue={`${metrics.medianWaitTime} min (mediana)`} />
                    <KPICard title="Tempo Médio Atendimento" value={`${metrics.avgServiceTime} min`} description="Duração do serviço" trend="neutral" />
                    <KPICard title="Taxa Finalização" value={`${metrics.attendanceRate}%`} description={`${metrics.completed} de ${metrics.total} atendimentos`} trend={Number(metrics.attendanceRate) > 80 ? 'up' : 'down'} />
                    <KPICard title="Máximo Tempo Espera" value={`${metrics.maxWaitTime} min`} description="Maior tempo registrado" />
                    <KPICard title="Atendimentos Prioritários" value={metrics.priorityCount} description="Atendimentos com prioridade" />
                    <KPICard title="Aguardando" value={metrics.waiting} description="Na fila de atendimento" />
                    <KPICard title="Cancelados/Não Compareceram" value={metrics.cancelled} description={`${((metrics.cancelled / metrics.total) * 100).toFixed(1)}% do total`} trend="down" />
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {timeSeriesData.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-border-color">
                            <h2 className="text-lg font-semibold text-text-primary mb-4">Tendência de Tempos</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={timeSeriesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="date" stroke="#6B7280" />
                                    <YAxis stroke="#6B7280" />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Tempo Espera" stroke="#204FA1" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Tempo Atendimento" stroke="#2E8B57" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {timeSeriesData.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-border-color">
                            <h2 className="text-lg font-semibold text-text-primary mb-4">Atendimentos por Dia</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsBarChart data={timeSeriesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="date" stroke="#6B7280" />
                                    <YAxis stroke="#6B7280" />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB' }} />
                                    <Legend />
                                    <Bar dataKey="completados" stackId="a" fill="#2E8B57" />
                                    <Bar dataKey="esperando" stackId="a" fill="#F59E0B" />
                                    <Bar dataKey="cancelados" stackId="a" fill="#EF4444" />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {serviceDistribution.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-border-color">
                            <h2 className="text-lg font-semibold text-text-primary mb-4">Distribuição por Serviço</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={serviceDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {serviceDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {userTypeDistribution.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-border-color">
                            <h2 className="text-lg font-semibold text-text-primary mb-4">Distribuição por Tipo de Usuário</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={userTypeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {userTypeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Tabela de últimos atendimentos */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-border-color">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Últimos Atendimentos Finalizados</h2>
                    <div className="overflow-x-auto">
                        {filteredTickets.filter((t) => t.status === 'completed').length > 0 ? (
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-border-color bg-slate-50">
                                    <tr>
                                        <th className="p-3 font-semibold text-text-secondary">Senha</th>
                                        <th className="p-3 font-semibold text-text-secondary">Tipo</th>
                                        <th className="p-3 font-semibold text-text-secondary">Serviço</th>
                                        <th className="p-3 font-semibold text-text-secondary">Operador</th>
                                        <th className="p-3 font-semibold text-text-secondary text-right">Tempo Espera</th>
                                        <th className="p-3 font-semibold text-text-secondary text-right">Tempo Atendimento</th>
                                        <th className="p-3 font-semibold text-text-secondary">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTickets
                                        .filter((t) => t.status === 'completed')
                                        .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
                                        .slice(0, 10)
                                        .map((ticket) => {
                                            const waitTime = ticket.started_at
                                                ? ((new Date(ticket.started_at).getTime() - new Date(ticket.created_at).getTime()) / 60000).toFixed(1)
                                                : '—';
                                            const serviceTime =
                                                ticket.started_at && ticket.completed_at
                                                    ? ((new Date(ticket.completed_at).getTime() - new Date(ticket.started_at).getTime()) / 60000).toFixed(1)
                                                    : '—';

                                            return (
                                                <tr key={ticket.id} className="border-b border-border-color hover:bg-slate-50">
                                                    <td className="p-3 font-mono font-bold text-text-primary">{ticket.formatted_number}</td>
                                                    <td className="p-3 text-text-secondary">
                                                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${ticket.is_priority ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {ticket.is_priority ? 'Prioritário' : 'Normal'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-text-primary">{ticket.service?.name || '—'}</td>
                                                    <td className="p-3 text-text-primary font-medium">{ticket.operator?.name || '—'}</td>
                                                    <td className="p-3 text-right text-text-primary">{waitTime} min</td>
                                                    <td className="p-3 text-right text-text-primary">{serviceTime} min</td>
                                                    <td className="p-3">
                                                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Finalizado</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-text-secondary py-8">Nenhum atendimento finalizado para os filtros selecionados.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center text-xs text-text-secondary pt-4 border-t border-border-color">
                    <p>Última atualização: {format(lastUpdated, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</p>
                    <p className="mt-1">Período: {format(parseISO(filters.startDate), 'dd/MM/yyyy', { locale: ptBR })} a {format(parseISO(filters.endDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </footer>
            </div>
        </div>
    );
};

export default MetricsDashboard;
