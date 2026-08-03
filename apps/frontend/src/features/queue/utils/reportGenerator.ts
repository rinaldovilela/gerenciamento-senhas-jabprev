import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Ticket } from '@shared/types';

export interface ReportFilterInfo {
    startDate: string;
    endDate: string;
    serviceName: string;
    operatorName: string;
    userTypeLabel: string;
    priorityLabel: string;
}

export interface ReportMetrics {
    total: number;
    completed: number;
    waiting: number;
    cancelled: number;
    priorityCount: number;
    avgWaitTime: string;
    medianWaitTime: string;
    avgServiceTime: string;
    maxWaitTime: number;
    attendanceRate: string;
}

export interface ServiceDistItem {
    name: string;
    value: number;
}

export interface TimeSeriesItem {
    date: string;
    tempoEspera: number;
    tempoAtendimento: number;
    completados: number;
    esperando: number;
    cancelados: number;
}

export interface ChartImages {
    slaGaugeImg?: string;
    timeTrendImg?: string;
    volumeBarImg?: string;
    servicePieImg?: string;
}

// Carrega o logotipo oficial da pasta public como Base64
const loadLogoBase64 = async (): Promise<string | null> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } else {
                    resolve(null);
                }
            } catch (e) {
                console.error('Erro convertendo logo para base64:', e);
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = '/logo-jabprev.png';
    });
};

/**
 * Gerador do Relatório Executivo em PDF da JaboatãoPrev
 */
export const generateExecutivePDFReport = async (params: {
    tickets: Ticket[];
    metrics: ReportMetrics;
    filters: ReportFilterInfo;
    serviceDistribution: ServiceDistItem[];
    timeSeriesData: TimeSeriesItem[];
    chartImages: ChartImages;
}) => {
    const { tickets, metrics, filters, serviceDistribution, timeSeriesData, chartImages } = params;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const logoBase64 = await loadLogoBase64();

    // Cores Institucionais JaboatãoPrev
    const PRIMARY_BLUE = [32, 79, 161] as [number, number, number]; // #204FA1
    const SECONDARY_BLUE = [15, 23, 42] as [number, number, number]; // #0F172A (Slate-900)
    const GOLD_ACCENT = [245, 158, 11] as [number, number, number]; // #F59E0B
    const GREEN_ACCENT = [16, 185, 129] as [number, number, number]; // #10B981
    const RED_ACCENT = [239, 68, 68] as [number, number, number]; // #EF4444
    const CARD_BG = [244, 246, 250] as [number, number, number];
    const TEXT_MUTED = [100, 116, 139] as [number, number, number];

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    // Helper para desenhar a faixa de cabeçalho padrão em páginas secundárias
    const drawHeaderBand = (titleText: string) => {
        // Top Primary Blue Bar
        doc.setFillColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
        doc.rect(0, 0, pageWidth, 16, 'F');

        // Gold Sub-bar
        doc.setFillColor(GOLD_ACCENT[0], GOLD_ACCENT[1], GOLD_ACCENT[2]);
        doc.rect(0, 16, pageWidth, 1.5, 'F');

        // Logo no canto superior esquerdo
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', margin, 2.5, 30, 11);
        } else {
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('JABOATÃOPREV', margin, 10);
        }

        // Título da Seção no lado direito
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(titleText.toUpperCase(), pageWidth - margin, 10.5, { align: 'right' });
    };

    // Helper para desenhar o rodapé padrão em todas as páginas
    const drawFooter = (currentPage: number, totalPages: number) => {
        const footerY = pageHeight - 10;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
        doc.text(
            `JaboatãoPrev - Autarquia Municipal de Previdência de Jaboatão dos Guararapes | Emissão: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
            margin,
            footerY
        );
        doc.text(`Página ${currentPage} de ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
    };

    // --- ANÁLISES TEXTUAIS DINÂMICAS ---
    const avgWaitNum = Number(metrics.avgWaitTime) || 0;
    const slaStatus = avgWaitNum <= 15 ? 'Excelente (dentro da meta de 15 min)' : avgWaitNum <= 30 ? 'Atenção (tempo entre 15 e 30 min)' : 'Crítico (acima de 30 min de espera)';
    
    // Serviço mais demandado
    const topService = serviceDistribution.length > 0
        ? serviceDistribution.reduce((prev, current) => (prev.value > current.value ? prev : current))
        : { name: 'Sem registros', value: 0 };
    const topServicePct = metrics.total > 0 ? ((topService.value / metrics.total) * 100).toFixed(1) : '0';

    // Diagnóstico temporal de espera
    const timeTrendDiagnostic = () => {
        if (timeSeriesData.length === 0) return 'Não há dados históricos suficientes para análise temporal no período selecionado.';
        const maxWaitDay = [...timeSeriesData].sort((a, b) => b.tempoEspera - a.tempoEspera)[0];
        const maxVolDay = [...timeSeriesData].sort((a, b) => (b.completados + b.esperando + b.cancelados) - (a.completados + a.esperando + a.cancelados))[0];
        return `O dia com maior tempo médio de espera foi ${maxWaitDay?.date || 'N/A'} (atingindo ${maxWaitDay?.tempoEspera || 0} min). O maior volume diário ocorreu em ${maxVolDay?.date || 'N/A'} com total de ${(maxVolDay?.completados || 0) + (maxVolDay?.esperando || 0) + (maxVolDay?.cancelados || 0)} senhas.`;
    };

    // ==========================================
    // PÁGINA 1: CAPA EXECULTIVA E RESUMO KPI
    // ==========================================
    
    // Header Banner Superior Azul Institucional
    doc.setFillColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
    doc.rect(0, 0, pageWidth, 42, 'F');
    doc.setFillColor(GOLD_ACCENT[0], GOLD_ACCENT[1], GOLD_ACCENT[2]);
    doc.rect(0, 42, pageWidth, 2, 'F');

    // Logo & Títulos na Capa
    if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', margin, 7, 45, 17);
    } else {
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('JABOATÃOPREV', margin, 18);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('RELATÓRIO EXECUTIVO DE ATENDIMENTO', pageWidth - margin, 17, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(220, 235, 255);
    doc.text('Gestão Integrada de Filas & Inteligência Previdenciária', pageWidth - margin, 24, { align: 'right' });

    let currentY = 52;

    // Quadro de Filtros e Metadados do Relatório
    doc.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2]);
    doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
    doc.text('PARÂMETROS E FILTROS APLICADOS', margin + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    const periodStr = `Período: ${format(parseISO(filters.startDate), 'dd/MM/yyyy')} a ${format(parseISO(filters.endDate), 'dd/MM/yyyy')}`;
    const servStr = `Serviço: ${filters.serviceName}`;
    const opStr = `Operador: ${filters.operatorName}`;
    const vincStr = `Vínculo: ${filters.userTypeLabel} | Fila: ${filters.priorityLabel}`;

    doc.text(periodStr, margin + 4, currentY + 12);
    doc.text(vincStr, margin + 4, currentY + 18);
    doc.text(servStr, margin + 95, currentY + 12);
    doc.text(opStr, margin + 95, currentY + 18);

    currentY += 30;

    // Título Seção KPIs
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(SECONDARY_BLUE[0], SECONDARY_BLUE[1], SECONDARY_BLUE[2]);
    doc.text('INDICADORES CHAVE DE DESEMPENHO (KPIs)', margin, currentY);
    
    currentY += 5;

    // Grade 4x2 de Cartões de KPI
    const kpiCards = [
        { label: 'TOTAL DE ATENDIMENTOS', val: String(metrics.total), sub: 'Senhas emitidas', color: PRIMARY_BLUE },
        { label: 'TEMPO MÉDIO ESPERA', val: `${metrics.avgWaitTime} min`, sub: `Mediana: ${metrics.medianWaitTime} min`, color: GOLD_ACCENT },
        { label: 'TEMPO MÉDIO ATENDIMENTO', val: `${metrics.avgServiceTime} min`, sub: 'Duração no guichê', color: GREEN_ACCENT },
        { label: 'TAXA DE FINALIZAÇÃO', val: `${metrics.attendanceRate}%`, sub: `${metrics.completed} concluídas`, color: GREEN_ACCENT },
        { label: 'MAIOR ESPERA REGISTRADA', val: `${metrics.maxWaitTime} min`, sub: 'Pico da fila', color: RED_ACCENT },
        { label: 'SENHAS PRIORITÁRIAS', val: String(metrics.priorityCount), sub: 'Atend. Preferencial', color: PRIMARY_BLUE },
        { label: 'AGUARDANDO NA FILA', val: String(metrics.waiting), sub: 'Senhas ativas', color: PRIMARY_BLUE },
        { label: 'DESISTÊNCIAS / AUSENTES', val: String(metrics.cancelled), sub: `${metrics.total > 0 ? ((metrics.cancelled / metrics.total) * 100).toFixed(1) : 0}% do total`, color: RED_ACCENT },
    ];

    const cardW = (contentWidth - 9) / 4;
    const cardH = 22;

    kpiCards.forEach((kpi, idx) => {
        const row = Math.floor(idx / 4);
        const col = idx % 4;
        const x = margin + col * (cardW + 3);
        const y = currentY + row * (cardH + 3);

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, y, cardW, cardH, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, y, cardW, cardH, 2, 2, 'D');

        // Borda superior colorida
        doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
        doc.rect(x, y, cardW, 1.2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
        doc.text(kpi.label, x + 3, y + 6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(SECONDARY_BLUE[0], SECONDARY_BLUE[1], SECONDARY_BLUE[2]);
        doc.text(kpi.val, x + 3, y + 13);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
        doc.text(kpi.sub, x + 3, y + 18);
    });

    currentY += (cardH * 2) + 12;

    // Resumo Executivo e Diagnóstico de Performance
    doc.setFillColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
    doc.roundedRect(margin, currentY, contentWidth, 75, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(GOLD_ACCENT[0], GOLD_ACCENT[1], GOLD_ACCENT[2]);
    doc.text('RESUMO EXECUTIVO & ANÁLISE DE IMPACTO', margin + 6, currentY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);

    const execLines = [
        `No período analisado (${format(parseISO(filters.startDate), 'dd/MM/yyyy')} a ${format(parseISO(filters.endDate), 'dd/MM/yyyy')}), a autarquia registrou um volume total de ${metrics.total} atendimentos prestados aos beneficiários da JaboatãoPrev.`,
        ``,
        `• Nível de Serviço (SLA): O tempo médio de espera geral fixou-se em ${metrics.avgWaitTime} minutos, enquadrando o desempenho institucional como: "${slaStatus}". A meta estabelecida de tolerância é de 15 minutos.`,
        `• Eficiência Operacional: A taxa de conclusão com atendimento efetivo em guichê foi de ${metrics.attendanceRate}%, somando ${metrics.completed} senhas finalizadas com sucesso.`,
        `• Demanda por Categoria: O serviço de maior fluxo registrado foi "${topService.name}", representando ${topServicePct}% de toda a demanda presencial.`,
        `• Desistências e Ausências: Registraram-se ${metrics.cancelled} senhas canceladas ou sem comparecimento do segurado (${metrics.total > 0 ? ((metrics.cancelled / metrics.total) * 100).toFixed(1) : 0}%).`,
        ``,
        `Recomendação Executiva: Acompanhar os horários de pico e redimensionar guichês de atendimento dedicados às categorias de serviços com maior tempo acumulado de espera.`
    ];

    let textY = currentY + 16;
    execLines.forEach((line) => {
        doc.text(line, margin + 6, textY, { maxWidth: contentWidth - 12 });
        textY += 6.5;
    });

    // ==========================================
    // PÁGINA 2: SLA & NÍVEL DE SERVIÇO DE FILA
    // ==========================================
    doc.addPage();
    drawHeaderBand('Seção 1: SLA e Nível de Serviço');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(SECONDARY_BLUE[0], SECONDARY_BLUE[1], SECONDARY_BLUE[2]);
    doc.text('1. ANÁLISE DE SLA E CUMPRIMENTO DA META INSTITUCIONAL', margin, 26);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text('Monitoramento contínuo do tempo de espera dos segurados em conformidade com o teto de 15 minutos.', margin, 31);

    // Gráfico de SLA Gauge
    if (chartImages.slaGaugeImg) {
        doc.addImage(chartImages.slaGaugeImg, 'PNG', margin + 15, 36, contentWidth - 30, 95);
    } else {
        doc.rect(margin, 36, contentWidth, 90, 'D');
        doc.text('Gráfico SLA Indisponível', margin + 10, 80);
    }

    // Texto Explicativo Dinâmico
    let boxY = 136;
    doc.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2]);
    doc.roundedRect(margin, boxY, contentWidth, 55, 3, 3, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, boxY, contentWidth, 55, 3, 3, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
    doc.text('DIAGNÓSTICO DETALHADO DO TEMPO DE ESPERA', margin + 5, boxY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const slaDiag = [
        `O gráfico acima apresenta o ponteiro do indicador SLA calculado para o período. Com um tempo médio atual de ${metrics.avgWaitTime} min e mediana de ${metrics.medianWaitTime} min, a fila presencial apresenta a seguinte situação:`,
        ``,
        `• Classificação Atual: ${slaStatus}.`,
        `• Teto de Espera Crítico: A maior espera isolada registrada no período foi de ${metrics.maxWaitTime} minutos.`,
        `• Relação Espera x Atendimento: Enquanto os segurados aguardaram em média ${metrics.avgWaitTime} min na recepção, o tempo médio efetivo de atendimento dentro do guichê durou ${metrics.avgServiceTime} min.`,
        ``,
        `Ação Sugerida: ${avgWaitNum > 15 ? 'Ativar triagem preventiva e readequar a chamada de senhas prioritárias para normalizar a fila dentro do teto de 15 min.' : 'Manter a operacionalidade atual dos guichês, operando dentro do parâmetro de excelência institucional.'}`
    ];

    let diagY = boxY + 15;
    slaDiag.forEach(line => {
        doc.text(line, margin + 5, diagY, { maxWidth: contentWidth - 10 });
        diagY += 5.5;
    });

    // ==========================================
    // PÁGINA 3: FLUXO E TENDÊNCIA TEMPORAL
    // ==========================================
    doc.addPage();
    drawHeaderBand('Seção 2: Tendência Temporal de Tempos');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(SECONDARY_BLUE[0], SECONDARY_BLUE[1], SECONDARY_BLUE[2]);
    doc.text('2. TENDÊNCIA TEMPORAL DOS TEMPOS DE ESPERA E ATENDIMENTO', margin, 26);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text('Evolução diária comparativa entre o tempo na fila de espera e o tempo de duração da consulta presencial.', margin, 31);

    if (chartImages.timeTrendImg) {
        doc.addImage(chartImages.timeTrendImg, 'PNG', margin, 36, contentWidth, 100);
    }

    boxY = 142;
    doc.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2]);
    doc.roundedRect(margin, boxY, contentWidth, 50, 3, 3, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, boxY, contentWidth, 50, 3, 3, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
    doc.text('ANÁLISE DE OSCILAÇÃO E DIAS DE PICO', margin + 5, boxY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const trendDiag = [
        timeTrendDiagnostic(),
        ``,
        `O gráfico de área acima reflete a variação das curvas ao longo do intervalo de datas. Quando a curva amarela (Tempo de Espera) ultrapassa a curva azul (Tempo de Atendimento), indica-se gargalo de chegada de beneficiários na recepção.`,
        ``,
        `Recomendação: Para os dias de pico identificados, recomenda-se disponibilizar guichês de suporte no horário inicial do expediente.`
    ];

    diagY = boxY + 15;
    trendDiag.forEach(line => {
        doc.text(line, margin + 5, diagY, { maxWidth: contentWidth - 10 });
        diagY += 6;
    });

    // Tabela de Dados Exatos da Tendência Temporal
    autoTable(doc, {
        head: [['Data', 'Média de Espera (min)', 'Média de Atendimento (min)', 'Status SLA (Meta 15m)']],
        body: timeSeriesData.map(d => [
            d.date,
            `${d.tempoEspera} min`,
            `${d.tempoAtendimento} min`,
            d.tempoEspera <= 15 ? 'DENTRO DA META' : 'EXCEDE META (15m)'
        ]),
        startY: boxY + 54,
        theme: 'grid',
        headStyles: { fillColor: PRIMARY_BLUE, textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                const val = data.cell.raw as string;
                if (val.includes('DENTRO')) {
                    data.cell.styles.textColor = GREEN_ACCENT;
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = RED_ACCENT;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
    });

    // ==========================================
    // PÁGINA 4: VOLUME DIÁRIO POR STATUS
    // ==========================================
    doc.addPage();
    drawHeaderBand('Seção 3: Volume Diário por Status');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(SECONDARY_BLUE[0], SECONDARY_BLUE[1], SECONDARY_BLUE[2]);
    doc.text('3. VOLUME DIÁRIO E DISTRIBUIÇÃO POR STATUS DE ATENDIMENTO', margin, 26);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text('Quantitativo de senhas processadas diariamente divididas em completadas, em espera e ausências/cancelamentos.', margin, 31);

    if (chartImages.volumeBarImg) {
        doc.addImage(chartImages.volumeBarImg, 'PNG', margin, 36, contentWidth, 100);
    }

    boxY = 142;
    doc.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2]);
    doc.roundedRect(margin, boxY, contentWidth, 50, 3, 3, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, boxY, contentWidth, 50, 3, 3, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
    doc.text('ANÁLISE DO FLUXO E RESOLUTIVIDADE DIÁRIA', margin + 5, boxY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const volumeDiag = [
        `Do total de ${metrics.total} senhas geradas, foram concluídas ${metrics.completed} (${metrics.attendanceRate}%), restando ${metrics.waiting} aguardando e ${metrics.cancelled} canceladas/não comparecidas.`,
        ``,
        `A barra verde representa o volume de sucesso nos guichês, enquanto as barras vermelhas indicam desistência por espera prolongada ou não comparência na chamada do painel.`,
        ``,
        `Índice de Abandono: ${metrics.total > 0 ? ((metrics.cancelled / metrics.total) * 100).toFixed(1) : 0}%. Manter este índice abaixo de 5% é o objetivo recomendado.`
    ];

    diagY = boxY + 15;
    volumeDiag.forEach(line => {
        doc.text(line, margin + 5, diagY, { maxWidth: contentWidth - 10 });
        diagY += 6;
    });

    // Tabela de Dados Exatos de Volume Diário
    autoTable(doc, {
        head: [['Data', 'Completados (Verde)', 'Aguardando (Amarelo)', 'Cancelados/Ausentes (Vermelho)', 'Total do Dia']],
        body: timeSeriesData.map(d => [
            d.date,
            String(d.completados),
            String(d.esperando),
            String(d.cancelados),
            String(d.completados + d.esperando + d.cancelados)
        ]),
        startY: boxY + 54,
        theme: 'grid',
        headStyles: { fillColor: PRIMARY_BLUE, textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] }
    });

    // ==========================================
    // PÁGINA 5: DISTRIBUIÇÃO POR SERVIÇO
    // ==========================================
    doc.addPage();
    drawHeaderBand('Seção 4: Demanda por Categoria de Serviço');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(SECONDARY_BLUE[0], SECONDARY_BLUE[1], SECONDARY_BLUE[2]);
    doc.text('4. DISTRIBUIÇÃO PERCENTUAL POR CATEGORIA DE SERVIÇO', margin, 26);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text('Proporção de chamados categorizados por tipo de solicitação previdenciária.', margin, 31);

    if (chartImages.servicePieImg) {
        doc.addImage(chartImages.servicePieImg, 'PNG', margin + 10, 36, contentWidth - 20, 100);
    }

    boxY = 142;
    doc.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2]);
    doc.roundedRect(margin, boxY, contentWidth, 50, 3, 3, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, boxY, contentWidth, 50, 3, 3, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
    doc.text('DETALHAMENTO DE DEMANDA PREVIDENCIÁRIA', margin + 5, boxY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const serviceDiag = [
        `O serviço com maior volume no período é "${topService.name}", totalizando ${topService.value} senhas (${topServicePct}% de toda a demanda da unidade).`,
        ``,
        `A especialização dos operadores por guichê para atender os serviços mais requisitados otimiza o tempo médio de atendimento e diminui o tempo de espera geral da autarquia.`,
        ``,
        `Total de Categorias Atendidas no Período: ${serviceDistribution.length} tipos de serviços diferenciados.`
    ];

    diagY = boxY + 15;
    serviceDiag.forEach(line => {
        doc.text(line, margin + 5, diagY, { maxWidth: contentWidth - 10 });
        diagY += 6;
    });

    // Tabela de Dados Exatos por Categoria de Serviço
    autoTable(doc, {
        head: [['Categoria de Serviço', 'Quantidade de Senhas Emitidas', 'Representação da Demanda (%)']],
        body: serviceDistribution.map(s => [
            s.name,
            `${s.value} senhas`,
            `${metrics.total > 0 ? ((s.value / metrics.total) * 100).toFixed(1) : 0}%`
        ]),
        startY: boxY + 54,
        theme: 'grid',
        headStyles: { fillColor: PRIMARY_BLUE, textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] }
    });

    // ==========================================
    // PÁGINA 6+: LISTAGEM DETALHADA DE ATENDIMENTOS
    // ==========================================
    doc.addPage();
    drawHeaderBand('Seção 5: Listagem Detalhada de Atendimentos');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(SECONDARY_BLUE[0], SECONDARY_BLUE[1], SECONDARY_BLUE[2]);
    doc.text('5. REGISTRO COMPLETO DE SENHAS FILTRADAS', margin, 26);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text(`Listagem analítica com a relação de todos os ${tickets.length} atendimentos registrados para os filtros selecionados.`, margin, 31);

    const tableRows = tickets.map((t) => [
        t.formatted_number,
        t.service?.name || '—',
        t.operator?.name || '—',
        t.user_type ? t.user_type.replace('_', ' ').toUpperCase() : '—',
        t.is_priority ? 'PRIORITÁRIO' : 'NORMAL',
        t.status === 'completed' ? 'FINALIZADA' : t.status === 'waiting' ? 'AGUARDANDO' : t.status === 'no_show' ? 'AUSENTE' : 'CANCELADA',
        format(parseISO(t.created_at), 'dd/MM/yyyy HH:mm'),
    ]);

    autoTable(doc, {
        head: [['Senha', 'Serviço', 'Operador', 'Vínculo', 'Fila', 'Status', 'Data/Hora']],
        body: tableRows,
        startY: 36,
        theme: 'striped',
        headStyles: {
            fillColor: PRIMARY_BLUE,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
            halign: 'left',
        },
        bodyStyles: {
            fontSize: 7.5,
            textColor: [51, 65, 85],
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: {
            0: { fontStyle: 'bold', textColor: PRIMARY_BLUE, cellWidth: 22 },
            1: { cellWidth: 40 },
            2: { cellWidth: 35 },
            3: { cellWidth: 25 },
            4: { cellWidth: 22 },
            5: { fontStyle: 'bold', cellWidth: 22 },
            6: { cellWidth: 26 },
        },
        didParseCell: (data) => {
            // Estilização customizada das células de status e prioridade
            if (data.section === 'body' && data.column.index === 5) {
                const statusVal = data.cell.raw as string;
                if (statusVal === 'FINALIZADA') {
                    data.cell.styles.textColor = GREEN_ACCENT;
                } else if (statusVal === 'AGUARDANDO') {
                    data.cell.styles.textColor = PRIMARY_BLUE;
                } else {
                    data.cell.styles.textColor = RED_ACCENT;
                }
            }
            if (data.section === 'body' && data.column.index === 4) {
                const priorityVal = data.cell.raw as string;
                if (priorityVal === 'PRIORITÁRIO') {
                    data.cell.styles.textColor = GOLD_ACCENT;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
    });

    // Adiciona número de páginas em todas as folhas geradas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(i, totalPages);
    }

    // Salva o arquivo PDF
    const filename = `relatorio_executivo_jaboataoprev_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(filename);
};
