
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQueue } from '../contexts/QueueContext';
import { TRANSLATIONS } from '../constants';
import type { Language, Ticket, TicketType, UserType } from '../types';

const language: Language = 'pt';

type Period = 'today' | 'week' | 'month';
type TicketTypeFilter = 'all' | 'normal' | 'priority';

const MetricCard: React.FC<{ title: string; value: string; description?: string; icon?: React.ReactNode }> = ({ title, value, description, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-start gap-4 border border-border-color">
        {icon && <div className="bg-jaboatao-blue/10 p-3 rounded-lg text-jaboatao-blue">{icon}</div>}
        <div>
            <h3 className="text-sm font-semibold text-text-secondary">{title}</h3>
            <p className="text-4xl font-bold mt-2 text-text-primary">{value}</p>
            {description && <p className="text-xs text-text-secondary mt-1">{description}</p>}
        </div>
    </div>
);

const LineChart: React.FC<{ data: { date: string; [key: string]: any }[], keys: string[], colors: string[] }> = ({ data, keys, colors }) => {
    if (data.length < 2) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-border-color h-full flex items-center justify-center">
                <p className="text-center text-text-secondary py-4">Dados insuficientes para exibir tendência. Selecione um período maior.</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.flatMap(d => keys.map(key => d[key] || 0)), 1);
    const yAxisLabels = [0, maxValue / 2, maxValue].map(v => v.toFixed(0));

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-border-color h-full">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Tendência de Tempos Médios (minutos)</h3>
            <div className="flex w-full h-64">
                <div className="flex flex-col justify-between text-right text-xs text-text-secondary pr-2">
                    {yAxisLabels.map(label => <span key={label}>{label}</span>)}
                </div>
                <div className="flex-grow border-l border-b border-border-color relative">
                    {keys.map((key, keyIndex) => (
                        <svg key={key} className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                            <polyline
                                fill="none"
                                stroke={colors[keyIndex % colors.length]}
                                strokeWidth="2"
                                points={data.map((d, i) => `${(i / (data.length - 1)) * 100}%,${100 - ((d[key] || 0) / maxValue) * 100}%`).join(' ')}
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    ))}
                </div>
            </div>
            <div className="flex justify-between text-xs text-text-secondary pl-8 pt-2">
                {data.map((d, i) => (i % (Math.floor(data.length / 5) + 1) === 0 || i === data.length - 1) && <span key={d.date}>{d.date}</span>)}
            </div>
            <div className="flex justify-center gap-4 mt-4">
                {keys.map((key, index) => (
                    <div key={key} className="flex items-center text-sm">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
                        <span className="text-text-secondary">{key}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const colors = ['bg-jaboatao-blue', 'bg-jaboatao-green-prev', 'bg-jaboatao-green-flag', 'bg-jaboatao-yellow', 'bg-jaboatao-orange', 'bg-red-500', 'bg-cyan-500'];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-border-color">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">{TRANSLATIONS.ticketsByService[language]}</h3>
            <div className="space-y-4">
                {data.length > 0 ? data.map((item, index) => (
                    <div key={item.label} className="grid grid-cols-4 gap-2 items-center">
                        <span className="text-sm text-text-secondary truncate col-span-1">{item.label}</span>
                        <div className="col-span-3 flex items-center">
                            <div className="w-full bg-border-color rounded-full h-6">
                                <div
                                    className={`${colors[index % colors.length]} h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-500`}
                                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                                >
                                    {item.value > 0 ? item.value : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-center text-text-secondary py-4">Nenhum dado para o período selecionado.</p>}
            </div>
        </div>
    );
};

const DetailedTable: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden border border-[#D0D5DD]">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Últimos Atendimentos Finalizados</h3>
            <div className="overflow-x-auto">
                {tickets.length > 0 ? (
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-border-color">
                            <th className="p-2 font-semibold text-text-secondary">Senha</th>
                            <th className="p-2 font-semibold text-text-secondary">Serviço</th>
                            <th className="p-2 font-semibold text-text-secondary text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.slice(0, 5).map((ticket) => (
                            <tr key={ticket.id} className="border-b border-border-color last:border-0 hover:bg-slate-50">
                                <td className="p-2 font-mono font-bold text-text-primary">{ticket.formatted_number}</td>
                                <td className="p-2 text-text-primary">{ticket?.service?.name || 'N/A'}</td>
                                <td className="p-2 text-center">
                                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-jaboatao-green-prev text-white">
                                        Finalizado
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 ) : <p className="text-center text-text-secondary py-8">Nenhum atendimento finalizado para os filtros selecionados.</p>}
            </div>
        </div>
    );
};


const MetricsDashboard: React.FC = () => {
    const { tickets: allTickets, services } = useQueue();
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    const [filters, setFilters] = useState({
        period: 'today' as Period,
        serviceId: 'all',
        type: 'all' as TicketTypeFilter,
        operatorId: 'all'
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
        }
    }, []);

    const operators = useMemo(() => {
        const ops = new Set<string>();
        allTickets.forEach(t => { if(t.operator_id) ops.add(t.operator_id) });
        return Array.from(ops);
    }, [allTickets]);

    const filteredTickets = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return allTickets.filter(ticket => {
            const ticketDate = new Date(ticket.created_at);
            if (filters.period === 'today' && ticketDate < startOfToday) return false;
            if (filters.period === 'week' && ticketDate < startOfWeek) return false;
            if (filters.period === 'month' && ticketDate < startOfMonth) return false;

            if (filters.serviceId !== 'all' && ticket.service_id !== filters.serviceId) return false;
            if (filters.operatorId !== 'all' && ticket.operator_id !== filters.operatorId) return false;
            
            if (filters.type === 'normal' && ticket.is_priority) return false;
            if (filters.type === 'priority' && !ticket.is_priority) return false;

            return true;
        });
    }, [allTickets, filters]);
    
    const metrics = useMemo(() => {
        const completed = filteredTickets.filter(t => t.status === 'completed' && t.started_at && t.completed_at);
        
        const waitTimes = completed
            .map(t => (new Date(t.started_at!).getTime() - new Date(t.created_at).getTime()) / (1000 * 60))
            .filter(t => t >= 0);
        const avgWaitTime = waitTimes.length > 0 ? (waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0;
        
        const serviceTimes = completed
            .map(t => (new Date(t.completed_at!).getTime() - new Date(t.started_at!).getTime()) / (1000 * 60))
            .filter(t => t >= 0);
        const avgServiceTime = serviceTimes.length > 0 ? (serviceTimes.reduce((a,b) => a+b, 0) / serviceTimes.length) : 0;

        const totalCycleTime = avgWaitTime + avgServiceTime;
        const attendanceRate = filteredTickets.length > 0 ? (completed.length / filteredTickets.length) * 100 : 0;

        const cancelledOrNoShow = filteredTickets.filter(t => t.status === 'cancelled' || t.status === 'no_show').length;

        return {
            total: filteredTickets.length,
            completed: completed.length,
            avgWaitTime: avgWaitTime.toFixed(1),
            avgServiceTime: avgServiceTime.toFixed(1),
            totalCycleTime: totalCycleTime.toFixed(1),
            attendanceRate: attendanceRate.toFixed(1),
            cancelledOrNoShow,
        };
    }, [filteredTickets]);

    const trendData = useMemo(() => {
        if (filters.period === 'today') return [];
        const dataByDay = new Map<string, { waitTimes: number[], serviceTimes: number[] }>();

        filteredTickets.forEach(ticket => {
            const day = new Date(ticket.created_at).toISOString().split('T')[0];
            if (!dataByDay.has(day)) dataByDay.set(day, { waitTimes: [], serviceTimes: [] });
            
            if (ticket.status === 'completed' && ticket.started_at) {
                const waitTime = (new Date(ticket.started_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60);
                if (waitTime >= 0) dataByDay.get(day)!.waitTimes.push(waitTime);
                if (ticket.completed_at) {
                    const serviceTime = (new Date(ticket.completed_at).getTime() - new Date(ticket.started_at).getTime()) / (1000 * 60);
                    if (serviceTime >= 0) dataByDay.get(day)!.serviceTimes.push(serviceTime);
                }
            }
        });
        const sortedDays = Array.from(dataByDay.keys()).sort();
        return sortedDays.map(day => {
            const { waitTimes, serviceTimes } = dataByDay.get(day)!;
            const avgWait = waitTimes.length ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length : 0;
            const avgService = serviceTimes.length ? serviceTimes.reduce((a, b) => a + b, 0) / serviceTimes.length : 0;
            return {
                date: new Date(day).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit'}),
                'Tempo de Espera': avgWait,
                'Tempo de Atendimento': avgService,
            };
        });
    }, [filteredTickets, filters.period]);

    const ticketsByServiceData = useMemo(() => {
        return services.map(service => ({
            label: service.name,
            value: filteredTickets.filter(t => t.service_id === service.id).length,
        })).filter(d => d.value > 0).sort((a,b) => b.value - a.value);
    }, [filteredTickets, services]);
    
    const exportData = useCallback((format: 'json' | 'csv' | 'xlsx') => {
        setExportDropdownOpen(false);
        const dataToExport = filteredTickets.map(t => {
            const waitTime = t.started_at ? ((new Date(t.started_at).getTime() - new Date(t.created_at).getTime()) / 60000) : null;
            const serviceTime = t.started_at && t.completed_at ? ((new Date(t.completed_at).getTime() - new Date(t.started_at).getTime()) / 60000) : null;

            return {
                senha: t.formatted_number, tipoUsuario: t.user_type, prioritario: t.is_priority, servico: t?.service?.name || 'N/A', status: t.status, dataCriacao: t.created_at, dataInicioAtendimento: t.started_at, dataFimAtendimento: t.completed_at, tempoEsperaMinutos: waitTime !== null ? waitTime.toFixed(2) : 'N/A', tempoAtendimentoMinutos: serviceTime !== null ? serviceTime.toFixed(2) : 'N/A', operador: t.operator_id || null
            };
        });

        const filename = `relatorio_atendimentos_${new Date().toISOString().split('T')[0]}`;
        let fileContent = '';
        let mimeType = '';
        let fileExtension: string = format;
        
        if (format === 'json') {
            fileContent = JSON.stringify(dataToExport, null, 2);
            mimeType = 'application/json';
        } else if (format === 'csv') {
            if (dataToExport.length === 0) return;
            const headers = Object.keys(dataToExport[0]);
            const csvRows = [headers.join(',')];
            dataToExport.forEach(row => {
                const values = headers.map(header => {
                    let val = row[header as keyof typeof row] ?? '';
                    if (typeof val === 'string' && val.includes(',')) {
                        val = `"${val}"`;
                    }
                    return val;
                });
                csvRows.push(values.join(','));
            });
            fileContent = csvRows.join('\n');
            mimeType = 'text/csv';
        } else if (format === 'xlsx') {
            if (dataToExport.length === 0) return;
            const headers = Object.keys(dataToExport[0]);
            const headerRow = `<Row>${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>`;
            const dataRows = dataToExport.map(row => `<Row>${headers.map(header => {
                const val = row[header as keyof typeof row];
                const type = typeof val === 'number' ? 'Number' : 'String';
                return `<Cell><Data ss:Type="${type}">${val ?? ''}</Data></Cell>`;
            }).join('')}</Row>`).join('');
            fileContent = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Relatorio"><Table>${headerRow}${dataRows}</Table></Worksheet></Workbook>`;
            mimeType = 'application/vnd.ms-excel';
            fileExtension = 'xls';
        }

        const blob = new Blob([fileContent], { type: mimeType });
        const href = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = href;
        link.download = `${filename}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }, [filteredTickets]);


    return (
        <div className="fade-in">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                 <h1 className="font-montserrat text-3xl font-semibold text-text-primary">{TRANSLATIONS.metricsDashboard[language]}</h1>
                 <div className="relative" ref={exportRef}>
                    <button 
                        onClick={() => setExportDropdownOpen(prev => !prev)}
                        disabled={filteredTickets.length === 0} 
                        className="flex items-center gap-2 py-2 px-4 text-sm font-semibold text-white bg-jaboatao-green-prev rounded-lg shadow-md hover:bg-[#267347] transition-all duration-200 transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Exportar Relatório
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    {exportDropdownOpen && (
                         <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-border-color animate-fade-in-up">
                            <a onClick={() => exportData('json')} className="block px-4 py-2 text-sm text-text-primary hover:bg-slate-100 cursor-pointer">JSON</a>
                            <a onClick={() => exportData('csv')} className="block px-4 py-2 text-sm text-text-primary hover:bg-slate-100 cursor-pointer">CSV</a>
                            <a onClick={() => exportData('xlsx')} className="block px-4 py-2 text-sm text-text-primary hover:bg-slate-100 cursor-pointer">XLSX (Excel)</a>
                        </div>
                    )}
                 </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md mb-8 border border-border-color">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div>
                        <label className="text-xs font-medium text-text-secondary block mb-1">Período</label>
                        <select value={filters.period} onChange={e => setFilters(f => ({...f, period: e.target.value as Period}))} className="w-full mt-1 p-2 bg-white border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-jaboatao-blue/50 text-sm text-text-primary transition">
                            <option value="today">Hoje</option>
                            <option value="week">Esta Semana</option>
                            <option value="month">Este Mês</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-text-secondary block mb-1">Serviço</label>
                        <select value={filters.serviceId} onChange={e => setFilters(f => ({...f, serviceId: e.target.value}))} className="w-full mt-1 p-2 bg-white border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-jaboatao-blue/50 text-sm text-text-primary transition">
                            <option value="all">Todos</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-text-secondary block mb-1">Tipo Atendimento</label>
                        <select value={filters.type} onChange={e => setFilters(f => ({...f, type: e.target.value as TicketTypeFilter}))} className="w-full mt-1 p-2 bg-white border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-jaboatao-blue/50 text-sm text-text-primary transition">
                            <option value="all">Todos</option>
                            <option value="normal">Normal</option>
                            <option value="priority">Prioritário</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-text-secondary block mb-1">ID Operador</label>
                        <select value={filters.operatorId} onChange={e => setFilters(f => ({...f, operatorId: e.target.value}))} className="w-full mt-1 p-2 bg-white border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-jaboatao-blue/50 text-sm text-text-primary transition">
                            <option value="all">Todos</option>
                            {operators.map(op => <option key={op} value={op}>{op.substring(0,8)}...</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard title={TRANSLATIONS.totalTickets[language]} value={metrics.total.toString()} description="No período filtrado" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>} />
                <MetricCard title={TRANSLATIONS.avgWaitTime[language]} value={`${metrics.avgWaitTime} min`} description="Média até o início" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
                 <MetricCard title="Tempo Médio Atendimento" value={`${metrics.avgServiceTime} min`} description="Duração do serviço" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>} />
                <MetricCard title={TRANSLATIONS.completedServices[language]} value={metrics.completed.toString()} description="Atendimentos finalizados" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} />
                <MetricCard title="Taxa de Comparecimento" value={`${metrics.attendanceRate}%`} description="Finalizados / Total" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m21.22 14.78-4.24-4.24" /><path d="m17 14.78 4.24-4.24" /></svg>} />
                <MetricCard title="Total Ciclo Atendimento" value={`${metrics.totalCycleTime} min`} description="Espera + Atendimento" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4" /><path d="M12 22V8" /><path d="m12 8-3 3" /><path d="m12 8 3 3" /><path d="M22 12h-4" /><path d="M8 12H2" /><path d="m4.93 19.07 2.12-2.12" /><path d="m16.95 7.05 2.12-2.12" /></svg>} />
                <MetricCard title="Cancelados / Não Compareceram" value={metrics.cancelledOrNoShow.toString()} description="Não finalizados" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 14.14 14.14" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <LineChart data={trendData} keys={['Tempo de Espera', 'Tempo de Atendimento']} colors={['#204FA1', '#2E8B57']} />
                <BarChart data={ticketsByServiceData} />
            </div>

            <div className="grid grid-cols-1 gap-8">
                <DetailedTable tickets={filteredTickets.filter(t => t.status === 'completed').sort((a,b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())} />
            </div>

            <footer className="text-center mt-8 text-xs text-text-secondary">
                Última atualização automática: {lastUpdated.toLocaleTimeString('pt-BR')}
            </footer>
        </div>
    );
};

export default MetricsDashboard;
