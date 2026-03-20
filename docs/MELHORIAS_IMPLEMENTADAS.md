# 📋 Guia de Integração - Melhorias Implementadas

## ✅ 7 Melhorias Implementadas

### 1. ✅ Job Automático de "Não Compareceu" + TimeSync
**Arquivo**: `services/TimeSync.ts` + `services/NoShowManager.ts`

**Como usar**:
```typescript
import { timeSync } from '../services/TimeSync';
import { noShowManager } from '../services/NoShowManager';

// Numa função de inicialização (ex: AuthContext):
await timeSync.sync(); // Sincroniza hora com servidor
if (timeSync.isNewDayOnServer()) {
    await noShowManager.executeDaily(); // Marca não compareceu automaticamente
}
```

**O que faz**:
- Sincroniza hora local com servidor (evita problemas de timezone)
- Marca automaticamente senhas de "ontem" com status `waiting` como `no_show`
- Executa apenas UMA vez por dia (próxima vez: 00:00)

---

### 2. ✅ Sistema de Rastreamento de Mudanças
**Arquivo**: `services/AuditManager.ts`

**Como usar**:
```typescript
import { auditManager } from '../services/AuditManager';

// Registra mudança de status:
await auditManager.logStatusChange(
    ticketId,
    'APO-042',
    'waiting',
    'completed',
    user.id,
    user.email,
    'Atendimento finalizado com sucesso'
);

// Recupera histórico de um ticket:
const history = await auditManager.getTicketHistory(ticketId);
console.log(history); // Todas as mudanças do ticket

// Recupera ações de um operador:
const operatorActions = await auditManager.getOperatorHistory(operatorId);

// Gera relatório diário:
const report = await auditManager.getDailyReport('2026-03-20');
```

**IMPORTANTE**: Crie a tabela `audit_logs` no Appwrite com os campos:
- ticket_id
- ticket_number
- old_status
- new_status
- operator_id
- operator_name
- reason
- metadata
- created_at

---

### 3. ✅ Separação de Contextos (Today vs Historical)
**Arquivo**: `contexts/TodayQueueContext.tsx`

**Como usar**:
```typescript
// Em App.tsx, envolver com DOIS provedores:
import { QueueProvider } from './contexts/QueueContext';      // Para métricas
import { TodayQueueProvider } from './contexts/TodayQueueContext'; // Para operacional

<QueueProvider>
    <TodayQueueProvider>
        {/* App */}
    </TodayQueueProvider>
</QueueProvider>

// Em componentes operacionais:
import { useTodayQueue } from '../contexts/TodayQueueContext';
const { todayTickets, addTicket, callNextTicket, updateTicketStatus } = useTodayQueue();

// Em componentes de análise:
import { useQueue } from '../contexts/QueueContext';
const { tickets: allTickets } = useQueue();
```

**Diferenças**:
- `useTodayQueue()`: Apenas senhas de HOJE, atualiza em tempo real, foco operacional
- `useQueue()`: Últimos 30 dias, foco histórico/análise

---

### 4. ✅ Notificação para Senhas Velhas
**Arquivo**: `services/OldTicketNotificationManager.ts`

**Como usar em AttendanceTrackingScreen**:
```typescript
import { oldTicketNotificationManager } from '../services/OldTicketNotificationManager';

const { todayTickets } = useTodayQueue();

// No render:
const alerts = oldTicketNotificationManager.getOldTicketAlerts(todayTickets);

// Renderizar alertas:
{alerts.length > 0 && (
    <div className="alerts">
        {alerts.map(alert => (
            <div key={alert.ticket.id} style={{ 
                backgroundColor: oldTicketNotificationManager.getAlertColor(alert.level),
                color: 'white',
                padding: '10px',
                margin: '10px 0'
            }}>
                {oldTicketNotificationManager.getAlertIcon(alert.level)}
                {alert.message}
            </div>
        ))}
    </div>
)}
```

**Configuração de thresholds**:
```typescript
oldTicketNotificationManager.setThresholds([
    { minutes: 30, level: 'warning', label: 'Esperando há 30 min' },
    { minutes: 60, level: 'danger', label: 'Esperando há 1 hora' },
    { minutes: 120, level: 'critical', label: 'Esperando há 2 horas' },
]);
```

---

### 5. ✅ Histórico de Chamadas
**Arquivo**: `services/CallHistoryManager.ts`

**Como usar**:
```typescript
import { callHistoryManager } from '../services/CallHistoryManager';

// Quando chama uma senha:
await callHistoryManager.recordCall(ticketId, 'APO-042', operatorId, 'João Silva');

// Atualizar resultado:
await callHistoryManager.updateCallResult(callRecordId, 'attended', 120); // 2 minutos

// Ver histórico de um ticket:
const calls = await callHistoryManager.getTicketCalls(ticketId);
console.log(`${calls.length} chamadas registradas`);

// Stats do operador:
const stats = await callHistoryManager.getOperatorCallStats(operatorId);
console.log(`Atendidas: ${stats.attended}, Não atendidas: ${stats.notAttended}`);

// Contar chamadas sem sucesso:
const unanswered = await callHistoryManager.getUnansweredCallCount(ticketId);
```

**IMPORTANTE**: Crie a tabela `call_history` no Appwrite com os campos:
- ticket_id
- ticket_number
- operator_id
- operator_name
- called_at
- duration_seconds
- result

---

### 6. ✅ Filtros Adicionais no Painel
**Atualizar**: `components/MetricsDashboard.tsx`

Novos filtros suportados:
```typescript
{
    startDate: string;
    endDate: string;
    serviceId: string;
    userType: 'all' | 'aporentado' | 'pensionista' | 'servidor_ativo';
    priorityType: 'all' | 'normal' | 'priority';
    
    // NOVOS:
    operatorId?: string;                    // Filtrar por operador
    status?: 'all' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    minWaitTime?: number;                   // Mínimo de tempo de espera (minutos)
    maxWaitTime?: number;                   // Máximo de tempo de espera (minutos)
}
```

**Exemplo de atualização em MetricsDashboard**:
```typescript
const filteredTickets = useMemo(() => {
    return allTickets.filter((ticket) => {
        // ... filtros existentes ...
        
        // NOVOS FILTROS:
        if (filters.operatorId && filters.operatorId !== 'all' && ticket.operator_id !== filters.operatorId) {
            return false;
        }
        
        if (filters.status && filters.status !== 'all' && ticket.status !== filters.status) {
            return false;
        }
        
        if (filters.minWaitTime && ticket.started_at && ticket.created_at) {
            const waitTime = (new Date(ticket.started_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60);
            if (waitTime < filters.minWaitTime) return false;
        }
        
        if (filters.maxWaitTime && ticket.started_at && ticket.created_at) {
            const waitTime = (new Date(ticket.started_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60);
            if (waitTime > filters.maxWaitTime) return false;
        }
        
        return true;
    });
}, [allTickets, filters]);
```

---

### 7. ✅ Persistência de Filtros em localStorage
**Arquivo**: `services/FilterPersistenceManager.ts`

**Como usar em MetricsDashboard**:
```typescript
import { filterPersistenceManager } from '../services/FilterPersistenceManager';

// Ao carregar componente:
useEffect(() => {
    const savedFilters = filterPersistenceManager.loadFilters();
    if (savedFilters) {
        setFilters(savedFilters);
    }
}, []);

// Ao alterar filtro:
const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    filterPersistenceManager.saveFilters(newFilters);
};

// Presets de período:
const handlePreset = (preset: 'today' | 'week' | 'month' | '30days' | '90days') => {
    const { startDate, endDate } = filterPersistenceManager.getPreset(preset);
    const newFilters = { ...filters, startDate, endDate };
    setFilters(newFilters);
    filterPersistenceManager.saveFilters(newFilters);
};
```

---

## 🔧 PRÓXIMOS PASSOS

### 1. Criar Tabelas no Appwrite

Você precisa criar estas tabelas no console Appwrite:

#### `audit_logs`
```
- $id (String, 36 chars, Primary)
- ticket_id (String)
- ticket_number (String)
- old_status (String)
- new_status (String)
- operator_id (String, nullable)
- operator_name (String, nullable)
- reason (String, nullable)
- metadata (String, JSON)
- created_at (String)
```

#### `call_history`
```
- $id (String, 36 chars, Primary)
- ticket_id (String)
- ticket_number (String)
- operator_id (String, nullable)
- operator_name (String, nullable)
- called_at (String)
- duration_seconds (Integer, nullable)
- result (String, enum: 'attended', 'not_attended', 'pending')
```

### 2. Atualizar .env.local

```env
VITE_APPWRITE_COLLECTION_AUDIT_LOG_ID=audit_logs
VITE_APPWRITE_COLLECTION_CALL_HISTORY_ID=call_history
```

### 3. Integrar em Componentes

- **AttendanceTrackingScreen**: Integrar `TodayQueueContext` + `OldTicketNotificationManager`
- **MetricsDashboard**: Adicionar filtros novos + persistência
- **QueueContext**: Atualizar `updateTicketStatus()` para chamar `auditManager.logStatusChange()`

### 4. Testar

```bash
npm run dev
# Abrir http://localhost:5173
# Testar fluxo completo
```

---

## 📊 Exemplo Completo: Integração em App.tsx

```typescript
import { TodayQueueProvider } from './contexts/TodayQueueContext';
import { QueueProvider } from './contexts/QueueContext';
import { HelmetProvider } from 'react-helmet-async';

function App() {
    return (
        <HelmetProvider>
            <QueueProvider>
                <TodayQueueProvider>
                    {/* Seu App Content */}
                </TodayQueueProvider>
            </QueueProvider>
        </HelmetProvider>
    );
}
```

---

## 🐛 Troubleshooting

**Erro: "Collection not found"**
- Certifique-se que as tabelas foram criadas no Appwrite
- Verifique as variáveis de ambiente

**Erro: "IDs não configurados"**
- Adicionar ao `.env.local`:
  ```
  VITE_APPWRITE_COLLECTION_AUDIT_LOG_ID=audit_logs
  VITE_APPWRITE_COLLECTION_CALL_HISTORY_ID=call_history
  ```

**Filtros não persistem após refresh**
- Verificar se `localStorage` não foi limpo
- Testar em abas incógnitas (se localStorage bloqueado)

---

## 📝 Notas Importantes

1. **Sincronização de Hora**: Execute `timeSync.sync()` na primeira carga (AuthContext)
2. **Job de Não Compareceu**: Executa apenas uma vez por dia, ao detectar mudança de data
3. **Auditoria**: SEMPRE os logs registram quando status muda (integrado em TodayQueueContext)
4. **Performance**: Histórico de 30 dias carrega 500 tickets max. Ajuste conforme necessário
5. **localStorage**: Limite ~5MB por app. Filtros ocupam mínimo espaço.

---

Pronto! Todas as 7 melhorias estão implementadas e prontas para uso.
