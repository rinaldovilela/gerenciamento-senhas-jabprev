/**
 * Old Ticket Notification Service
 * Alerta quando uma senha fica esperando muito tempo (>30 min, >1 hora, etc)
 */

import type { Ticket } from '../types';

export type AlertLevel = 'warning' | 'danger' | 'critical';

export interface OldTicketAlert {
    ticket: Ticket;
    waitingMinutes: number;
    level: AlertLevel;
    message: string;
}

interface OldTicketThreshold {
    minutes: number;
    level: AlertLevel;
    label: string;
}

class OldTicketNotificationManager {
    private thresholds: OldTicketThreshold[] = [
        { minutes: 30, level: 'warning', label: 'Esperando há 30 min' },
        { minutes: 60, level: 'danger', label: 'Esperando há 1 hora' },
        { minutes: 120, level: 'critical', label: 'Esperando há 2 horas (!!)' },
    ];

    /**
     * Analisa senhas em espera e retorna alertas
     */
    getOldTicketAlerts(todayTickets: Ticket[]): OldTicketAlert[] {
        const alerts: OldTicketAlert[] = [];
        const now = new Date();

        // Filtra apenas senhas em espera
        const waitingTickets = todayTickets.filter(t => t.status === 'waiting');

        waitingTickets.forEach(ticket => {
            const createdAt = new Date(ticket.created_at);
            const waitingMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));

            // Encontra o nível de alerta apropriado (maior threshold)
            let alertLevel: AlertLevel | null = null;
            let message = '';

            // Ordena thresholds por minutos (descendente) para pegar o maior
            const sortedThresholds = [...this.thresholds].sort((a, b) => b.minutes - a.minutes);

            for (const threshold of sortedThresholds) {
                if (waitingMinutes >= threshold.minutes) {
                    alertLevel = threshold.level;
                    message = `${ticket.formatted_number}: ${threshold.label}`;
                    break;
                }
            }

            if (alertLevel) {
                alerts.push({
                    ticket,
                    waitingMinutes,
                    level: alertLevel,
                    message,
                });
            }
        });

        return alerts.sort((a, b) => {
            // Ordena por criticidade
            const levelOrder = { critical: 0, danger: 1, warning: 2 };
            return levelOrder[a.level] - levelOrder[b.level];
        });
    }

    /**
     * Retorna resumo de alertas por nível
     */
    getSummary(alerts: OldTicketAlert[]): Record<AlertLevel, number> {
        return {
            warning: alerts.filter(a => a.level === 'warning').length,
            danger: alerts.filter(a => a.level === 'danger').length,
            critical: alerts.filter(a => a.level === 'critical').length,
        };
    }

    /**
     * Retorna cor CSS para o nível de alerta
     */
    getAlertColor(level: AlertLevel): string {
        const colors = {
            warning: '#ff9800', // Laranja
            danger: '#f44336', // Vermelho
            critical: '#b71c1c', // Vermelho escuro
        };
        return colors[level];
    }

    /**
     * Retorna ícone para o nível de alerta
     */
    getAlertIcon(level: AlertLevel): string {
        const icons = {
            warning: '⚠️',
            danger: '🚨',
            critical: '❌',
        };
        return icons[level];
    }

    /**
     * Inicializa notificações de som/push (opcional)
     */
    async playSoundAlert(level: AlertLevel): Promise<void> {
        try {
            // Usa Web Audio API para criar bips
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = level === 'critical' ? 1000 : level === 'danger' ? 800 : 600;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('[OldTicketNotification] Erro ao tocar som:', error);
        }
    }

    /**
     * Configura thresholds customizados
     */
    setThresholds(newThresholds: OldTicketThreshold[]): void {
        this.thresholds = newThresholds.sort((a, b) => a.minutes - b.minutes);
        console.log('[OldTicketNotification] Thresholds atualizados:', this.thresholds);
    }

    /**
     * Retorna thresholds atuais
     */
    getThresholds(): OldTicketThreshold[] {
        return [...this.thresholds];
    }
}

export const oldTicketNotificationManager = new OldTicketNotificationManager();
