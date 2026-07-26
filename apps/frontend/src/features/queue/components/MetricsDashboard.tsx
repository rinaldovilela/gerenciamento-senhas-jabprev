import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQueue } from '@features/queue/contexts/QueueContext';
import type { Language, Ticket, UserType } from '@shared/types';
import { format, subDays, startOfDay, endOfDay, parseISO, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
    TrendingUp, 
    Clock, 
    Users, 
    CheckCircle2, 
    AlertTriangle, 
    Download, 
    Calendar, 
    Filter, 
    FileText, 
    PieChart as PieChartIcon, 
    Activity,
    ChevronDown,
    Award,
    Hourglass
} from 'lucide-react';
import Toast from '@shared/components/Toast';

// TREE-SHAKEN APACHE ECHARTS CORE IMPORTS (SUPER LEVE)
import EChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart, GaugeChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    LineChart, 
    BarChart, 
    PieChart, 
    GaugeChart, 
    TooltipComponent, 
    GridComponent, 
    LegendComponent, 
    CanvasRenderer
]);

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
    trendValue?: string;
    accentColor?: string;
}> = ({
    title,
    value,
    description,
    icon,
    trend,
    trendValue,
    accentColor = 'from-amber-500 to-yellow-400'
}) => (
    <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl hover:shadow-amber-500/5 hover:border-white/20 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between h-full group relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accentColor} opacity-70 group-hover:opacity-100 transition-opacity duration-300`}></div>
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
                <h3 className="text-3xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors duration-200">{value}</h3>
                {description && <p className="text-xs font-medium text-slate-400 mt-1.5">{description}</p>}
            </div>
            {icon && (
                <div className="p-3 bg-white/5 border border-white/10 text-amber-400 rounded-2xl shadow-inner transition-transform duration-300 group-hover:scale-110">
                    {icon}
                </div>
            )}
        </div>
        {trendValue && (
            <div className={`flex items-center gap-1.5 mt-4 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border w-fit ${
                trend === 'up' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : trend === 'down' 
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                        : 'bg-slate-500/10 border-slate-500/30 text-slate-400'
            }`}>
                {trend === 'up' && <span>↑</span>}
                {trend === 'down' && <span>↓</span>}
                {trend === 'neutral' && <span>→</span>}
                <span>{trendValue}</span>
            </div>
        )}
    </div>
);

const MetricsDashboard: React.FC = () => {
    const { tickets: allTickets, services, fetchTicketsByDateRange } = useQueue();
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const [quickRange, setQuickRange] = useState<'today' | '7days' | '30days' | 'month'>('30days');
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

    const handleQuickRange = (range: 'today' | '7days' | '30days' | 'month') => {
        setQuickRange(range);
        const now = new Date();
        let start = now;
        if (range === 'today') start = now;
        else if (range === '7days') start = subDays(now, 7);
        else if (range === '30days') start = subDays(now, 30);
        else if (range === 'month') start = startOfMonth(now);

        setFilters((prev) => ({
            ...prev,
            startDate: format(start, 'yyyy-MM-dd'),
            endDate: format(now, 'yyyy-MM-dd'),
        }));
    };

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
    }, [filters.startDate, filters.endDate, fetchTicketsByDateRange]);

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
                tempoEspera: parseFloat(avgWait.toFixed(1)),
                tempoAtendimento: parseFloat(avgService.toFixed(1)),
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

    // APACHE ECHARTS OPTIONS
    const timeTrendOption = useMemo(() => ({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            textStyle: { color: '#F8FAFC', fontSize: 12 },
            borderRadius: 12,
        },
        legend: {
            data: ['Tempo Espera (min)', 'Tempo Atendimento (min)'],
            textStyle: { color: '#94A3B8', fontWeight: 'bold' },
            top: 0,
        },
        grid: { left: 40, right: 20, bottom: 30, top: 35 },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeSeriesData.map(d => d.date),
            axisLine: { lineStyle: { color: '#334155' } },
            axisLabel: { color: '#94A3B8', fontWeight: 600 },
        },
        yAxis: {
            type: 'value',
            axisLine: { show: false },
            splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
            axisLabel: { color: '#94A3B8', fontWeight: 600 },
        },
        series: [
            {
                name: 'Tempo Espera (min)',
                type: 'line',
                smooth: true,
                symbolSize: 8,
                itemStyle: { color: '#F59E0B' },
                areaStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{ offset: 0, color: 'rgba(245, 158, 11, 0.4)' }, { offset: 1, color: 'rgba(245, 158, 11, 0)' }]
                    }
                },
                data: timeSeriesData.map(d => d.tempoEspera)
            },
            {
                name: 'Tempo Atendimento (min)',
                type: 'line',
                smooth: true,
                symbolSize: 8,
                itemStyle: { color: '#3B82F6' },
                areaStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{ offset: 0, color: 'rgba(59, 130, 246, 0.4)' }, { offset: 1, color: 'rgba(59, 130, 246, 0)' }]
                    }
                },
                data: timeSeriesData.map(d => d.tempoAtendimento)
            }
        ]
    }), [timeSeriesData]);

    const volumeBarOption = useMemo(() => ({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            textStyle: { color: '#F8FAFC', fontSize: 12 },
            borderRadius: 12,
        },
        legend: {
            data: ['Completados', 'Aguardando', 'Cancelados'],
            textStyle: { color: '#94A3B8', fontWeight: 'bold' },
            top: 0,
        },
        grid: { left: 40, right: 20, bottom: 30, top: 35 },
        xAxis: {
            type: 'category',
            data: timeSeriesData.map(d => d.date),
            axisLine: { lineStyle: { color: '#334155' } },
            axisLabel: { color: '#94A3B8', fontWeight: 600 },
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
            axisLabel: { color: '#94A3B8', fontWeight: 600 },
        },
        series: [
            {
                name: 'Completados',
                type: 'bar',
                stack: 'total',
                itemStyle: { color: '#10B981', borderRadius: [0, 0, 4, 4] },
                data: timeSeriesData.map(d => d.completados)
            },
            {
                name: 'Aguardando',
                type: 'bar',
                stack: 'total',
                itemStyle: { color: '#F59E0B' },
                data: timeSeriesData.map(d => d.esperando)
            },
            {
                name: 'Cancelados',
                type: 'bar',
                stack: 'total',
                itemStyle: { color: '#EF4444', borderRadius: [4, 4, 0, 0] },
                data: timeSeriesData.map(d => d.cancelados)
            }
        ]
    }), [timeSeriesData]);

    const servicePieOption = useMemo(() => ({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            textStyle: { color: '#F8FAFC', fontSize: 12 },
            borderRadius: 12,
        },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            textStyle: { color: '#94A3B8', fontSize: 11, fontWeight: 600 },
        },
        series: [
            {
                name: 'Serviços',
                type: 'pie',
                radius: ['45%', '75%'],
                center: ['40%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: '#0F172A',
                    borderWidth: 3
                },
                label: { show: false },
                emphasis: {
                    label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#F8FAFC' }
                },
                data: serviceDistribution.map((s, idx) => {
                    const palette = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#06B6D4'];
                    return { name: s.name, value: s.value, itemStyle: { color: palette[idx % palette.length] } };
                })
            }
        ]
    }), [serviceDistribution]);

    const slaGaugeOption = useMemo(() => {
        const avgWait = Number(metrics.avgWaitTime);
        return {
            backgroundColor: 'transparent',
            series: [
                {
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 45,
                    splitNumber: 3,
                    axisLine: {
                        lineStyle: {
                            width: 16,
                            color: [
                                [0.33, '#10B981'], // Excelente (<=15m)
                                [0.66, '#F59E0B'], // Atenção (15-30m)
                                [1, '#EF4444']    // Crítico (>30m)
                            ]
                        }
                    },
                    pointer: {
                        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                        length: '60%',
                        width: 8,
                        offsetCenter: [0, '-40%'],
                        itemStyle: { color: '#F8FAFC' }
                    },
                    axisTick: { length: 8, lineStyle: { color: 'auto', width: 2 } },
                    splitLine: { length: 12, lineStyle: { color: 'auto', width: 3 } },
                    axisLabel: { color: '#94A3B8', fontSize: 10, distance: -40 },
                    title: { offsetCenter: [0, '20%'], fontSize: 12, color: '#94A3B8', fontWeight: 600 },
                    detail: {
                        valueAnimation: true,
                        offsetCenter: [0, '-10%'],
                        fontSize: 24,
                        fontWeight: 'bolder',
                        formatter: '{value} min',
                        color: '#F8FAFC'
                    },
                    data: [{ value: avgWait, name: 'SLA Espera Médio' }]
                }
            ]
        };
    }, [metrics.avgWaitTime]);

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

    return (
        <div ref={dashboardRef} className="space-y-8 max-w-[1600px] mx-auto w-full text-slate-100 pb-10">
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            />

            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-4 border-b border-white/10">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h1 className="font-montserrat text-2xl sm:text-3xl font-black text-white tracking-tight">
                                Painel de Métricas & Inteligência
                            </h1>
                            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">Análise executiva de performance, tempos de fila e distribuição de atendimento.</p>
                        </div>
                    </div>
                </div>

                {/* Quick Date Range Pills + Export */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="flex bg-slate-900/80 p-1 border border-white/10 rounded-2xl">
                        <button
                            onClick={() => handleQuickRange('today')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${quickRange === 'today' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            Hoje
                        </button>
                        <button
                            onClick={() => handleQuickRange('7days')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${quickRange === '7days' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            7 Dias
                        </button>
                        <button
                            onClick={() => handleQuickRange('30days')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${quickRange === '30days' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            30 Dias
                        </button>
                        <button
                            onClick={() => handleQuickRange('month')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${quickRange === 'month' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            Este Mês
                        </button>
                    </div>

                    <div className="relative" ref={exportRef}>
                        <button
                            onClick={() => setExportDropdownOpen((prev) => !prev)}
                            disabled={filteredTickets.length === 0}
                            className="flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-bold text-slate-950 bg-gradient-to-r from-jaboatao-yellow to-amber-500 hover:brightness-110 rounded-2xl shadow-lg shadow-amber-500/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={16} />
                            <span>Exportar</span>
                            <ChevronDown size={14} />
                        </button>
                        {exportDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-30 p-2 text-xs font-bold">
                                <button onClick={exportPDF} className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-slate-200 hover:bg-white/5 rounded-xl transition-all">
                                    <FileText size={16} className="text-red-400" /> Exportar PDF
                                </button>
                                <button onClick={exportJSON} className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-slate-200 hover:bg-white/5 rounded-xl transition-all">
                                    <FileText size={16} className="text-blue-400" /> Exportar JSON
                                </button>
                                <button onClick={exportCSV} className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-slate-200 hover:bg-white/5 rounded-xl transition-all">
                                    <FileText size={16} className="text-emerald-400" /> Exportar CSV
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Painel de Filtros */}
            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    <Filter size={16} className="text-amber-400" />
                    <span>Filtros Avançados</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Data Inicial</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Data Final</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Serviço</label>
                        <select
                            value={filters.serviceId}
                            onChange={(e) => setFilters((f) => ({ ...f, serviceId: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all cursor-pointer"
                        >
                            <option value="all">Todos os Serviços</option>
                            {services.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Operador</label>
                        <select
                            value={filters.operatorId}
                            onChange={(e) => setFilters((f) => ({ ...f, operatorId: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all cursor-pointer"
                        >
                            <option value="all">Todos os Operadores</option>
                            {operators.map((op) => (
                                <option key={op.id} value={op.id}>{op.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Vínculo</label>
                        <select
                            value={filters.userType}
                            onChange={(e) => setFilters((f) => ({ ...f, userType: e.target.value as any }))}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all cursor-pointer"
                        >
                            <option value="all">Todos os Vínculos</option>
                            <option value="aposentado">Aposentado</option>
                            <option value="pensionista">Pensionista</option>
                            <option value="servidor_ativo">Servidor Ativo</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Fila</label>
                        <select
                            value={filters.priorityType}
                            onChange={(e) => setFilters((f) => ({ ...f, priorityType: e.target.value as any }))}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all cursor-pointer"
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
                <KPICard title="Total de Atendimentos" value={metrics.total} icon={<TrendingUp size={22} />} description="Senhas no período" accentColor="from-blue-500 to-indigo-500" />
                <KPICard title="Tempo Médio Espera" value={`${metrics.avgWaitTime} min`} icon={<Clock size={22} />} description="Tempo até ser chamado" trend="up" trendValue={`${metrics.medianWaitTime}m (mediana)`} accentColor="from-amber-500 to-yellow-400" />
                <KPICard title="Tempo Médio Atendimento" value={`${metrics.avgServiceTime} min`} icon={<Hourglass size={22} />} description="Duração em guichê" trend="neutral" accentColor="from-emerald-500 to-teal-400" />
                <KPICard title="Taxa de Finalização" value={`${metrics.attendanceRate}%`} icon={<CheckCircle2 size={22} />} description={`${metrics.completed} de ${metrics.total} senhas`} trend={Number(metrics.attendanceRate) > 80 ? 'up' : 'down'} accentColor="from-teal-400 to-emerald-500" />
                <KPICard title="Maior Espera Registrada" value={`${metrics.maxWaitTime} min`} icon={<AlertTriangle size={22} />} description="Pico máximo da fila" accentColor="from-rose-500 to-red-400" />
                <KPICard title="Senhas Prioritárias" value={metrics.priorityCount} icon={<Award size={22} />} description="Atendimento preferencial" accentColor="from-purple-500 to-indigo-400" />
                <KPICard title="Aguardando na Fila" value={metrics.waiting} icon={<Users size={22} />} description="Senhas ativas no momento" accentColor="from-cyan-500 to-blue-400" />
                <KPICard title="Cancelados / Ausentes" value={metrics.cancelled} icon={<AlertTriangle size={22} />} description={`${metrics.total > 0 ? ((metrics.cancelled / metrics.total) * 100).toFixed(1) : 0}% do total`} trend="down" accentColor="from-slate-500 to-slate-400" />
            </div>

            {/* Seção Gráficos Executivos (EChartsCore Tree-Shaken) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gauge SLA */}
                <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">SLA & Desempenho Fila</h2>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-lg">Meta: 15 min</span>
                    </div>
                    <div className="h-64 flex items-center justify-center">
                        <EChartsCore echarts={echarts} option={slaGaugeOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>

                {/* ECharts Tendência de Tempos (Área Fluida) */}
                <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Fluxo & Tendência de Tempos (Espera vs Atendimento)</h2>
                    <div className="h-64">
                        <EChartsCore echarts={echarts} option={timeTrendOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Volume por Dia */}
                <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Volume Diário por Status</h2>
                    <div className="h-72">
                        <EChartsCore echarts={echarts} option={volumeBarOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>

                {/* Donut de Serviços */}
                <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Distribuição por Categoria de Serviço</h2>
                    <div className="h-72">
                        <EChartsCore echarts={echarts} option={servicePieOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>
            </div>

            {/* Tabela de Histórico Recente */}
            <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={16} className="text-amber-400" />
                        Histórico Filtrado de Atendimentos ({filteredTickets.length})
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    {filteredTickets.length > 0 ? (
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-950/40">
                                    <th className="px-6 py-4">Senha</th>
                                    <th className="px-6 py-4">Serviço</th>
                                    <th className="px-6 py-4 hidden md:table-cell">Operador</th>
                                    <th className="px-6 py-4 hidden lg:table-cell">Vínculo</th>
                                    <th className="px-6 py-4 hidden sm:table-cell">Prioridade</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 hidden sm:table-cell">Emissão</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-medium text-slate-200">
                                {filteredTickets.slice(0, 15).map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-amber-400">{ticket.formatted_number}</td>
                                        <td className="px-6 py-4">{ticket.service?.name || '—'}</td>
                                        <td className="px-6 py-4 hidden md:table-cell text-slate-400">{ticket.operator?.name || '—'}</td>
                                        <td className="px-6 py-4 uppercase text-[10px] font-bold text-slate-400 hidden lg:table-cell">{ticket.user_type.replace('_', ' ')}</td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            {ticket.is_priority ? (
                                                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md text-[9px] font-bold uppercase tracking-wider">Preferencial</span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md text-[9px] font-bold uppercase tracking-wider">Normal</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                                                ticket.status === 'completed'
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                    : ticket.status === 'waiting'
                                                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                            }`}>
                                                {ticket.status === 'completed' ? 'Finalizada' : ticket.status === 'waiting' ? 'Aguardando' : ticket.status === 'no_show' ? 'Ausente' : 'Cancelada'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 font-mono text-[11px] hidden sm:table-cell">
                                            {format(parseISO(ticket.created_at), 'dd/MM/yyyy HH:mm')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-slate-400 py-16 font-bold text-xs">Nenhum atendimento finalizado para os filtros selecionados.</p>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-4 border-t border-white/10">
                <p>Sincronização em Tempo Real | Última atualização: {format(lastUpdated, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</p>
            </footer>
        </div>
    );
};

export default MetricsDashboard;
