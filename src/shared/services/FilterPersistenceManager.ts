/**
 * Filter Persistence Service
 * Persiste e recupera filtros do painel de métricas em localStorage
 */

export interface FilterState {
    startDate: string;
    endDate: string;
    serviceId: string;
    userType: 'all' | 'aporentado' | 'pensionista' | 'servidor_ativo';
    priorityType: 'all' | 'normal' | 'priority';
    // Novos filtros
    operatorId?: string;
    status?: 'all' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    minWaitTime?: number; // em minutos
    maxWaitTime?: number; // em minutos
}

const STORAGE_KEY = 'metrics_dashboard_filters';
const STORAGE_KEY_TABS = 'metrics_active_tabs';

class FilterPersistenceManager {
    /**
     * Salva filtros em localStorage
     */
    saveFilters(filters: FilterState): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
            console.log('[FilterPersistence] Filtros salvos:', filters);
        } catch (error) {
            console.warn('[FilterPersistence] Erro ao salvar filtros:', error);
        }
    }

    /**
     * Recupera filtros do localStorage
     */
    loadFilters(): FilterState | null {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return null;

            const filters = JSON.parse(stored) as FilterState;
            console.log('[FilterPersistence] Filtros carregados:', filters);
            return filters;
        } catch (error) {
            console.warn('[FilterPersistence] Erro ao carregar filtros:', error);
            return null;
        }
    }

    /**
     * Limpa filtros salvos
     */
    clearFilters(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('[FilterPersistence] Filtros limpos');
        } catch (error) {
            console.warn('[FilterPersistence] Erro ao limpar filtros:', error);
        }
    }

    /**
     * Salva qual aba/tab está ativa (Métricas vs Acompanhamento)
     */
    saveActiveTab(tabName: string): void {
        try {
            localStorage.setItem(STORAGE_KEY_TABS, tabName);
        } catch (error) {
            console.warn('[FilterPersistence] Erro ao salvar aba ativa:', error);
        }
    }

    /**
     * Recupera qual aba/tab estava ativa
     */
    loadActiveTab(): string | null {
        try {
            return localStorage.getItem(STORAGE_KEY_TABS);
        } catch (error) {
            console.warn('[FilterPersistence] Erro ao carregar aba ativa:', error);
            return null;
        }
    }

    /**
     * Retorna um preset de período comum
     */
    getPreset(preset: 'today' | 'week' | 'month' | 'quarter' | '30days' | '90days'): {
        startDate: string;
        endDate: string;
    } {
        const today = new Date();
        const endDate = today.toISOString().split('T')[0];
        let startDate = '';

        switch (preset) {
            case 'today':
                startDate = endDate;
                break;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                startDate = weekAgo.toISOString().split('T')[0];
                break;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                startDate = monthAgo.toISOString().split('T')[0];
                break;
            case 'quarter':
                const quarterAgo = new Date(today);
                quarterAgo.setMonth(quarterAgo.getMonth() - 3);
                startDate = quarterAgo.toISOString().split('T')[0];
                break;
            case '30days':
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                startDate = thirtyDaysAgo.toISOString().split('T')[0];
                break;
            case '90days':
                const ninetyDaysAgo = new Date(today);
                ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                startDate = ninetyDaysAgo.toISOString().split('T')[0];
                break;
        }

        return { startDate, endDate };
    }
}

export const filterPersistenceManager = new FilterPersistenceManager();
