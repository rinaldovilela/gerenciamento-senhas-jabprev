# 🔧 Guia Prático - Usando Supabase na Aplicação

## 📌 Quick Start

### 1. Importar Supabase em um Componente

```typescript
import { useTodayQueue } from '../contexts/TodayQueueContext';

const MeuComponente = () => {
    const { todayTickets, addTicket, updateTicketStatus, services } = useTodayQueue();
    
    return (
        <div>
            {/* Seu código */}
        </div>
    );
};
```

---

## 📚 Referência de APIs

### TodayQueueContext (Senhas de Hoje)

#### Estado
```typescript
const {
    todayTickets,           // Ticket[] - Senhas de hoje
    services,               // Service[] - Lista de serviços
    calledTicket,           // Ticket | null - Senha chamada atualmente
    isLoadingToday,         // boolean - Está carregando?
} = useTodayQueue();
```

#### Funções
```typescript
const {
    // Adicionar nova senha
    addTicket: (serviceId: string, userType: UserType, isPriority: boolean) => Promise<Ticket | null>
    
    // Chamar próxima senha
    callNextTicket: (serviceId: string) => Promise<void>
    
    // Atualizar status da senha
    updateTicketStatus: (ticketId: string, status: TicketStatus, reason?: string) => Promise<void>
    
    // Recarregar dados
    refreshTodayTickets: () => Promise<void>
    
    // Contar senhas de hoje
    getTodayTicketCount: () => number
} = useTodayQueue();
```

---

### QueueContext (Análise Histórica)

#### Estado
```typescript
const {
    tickets,                // Ticket[] - Senhas do período
    services,               // Service[] - Lista de serviços
    isLoading,              // boolean - Está carregando?
} = useQueue();
```

#### Funções
```typescript
const {
    // Buscar senhas por período
    fetchTicketsByDateRange: (startDate: Date, endDate: Date) => Promise<Ticket[]>
    
    // Recarregar dados (últimos 30 dias)
    refreshData: () => Promise<void>
} = useQueue();
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Criar Nova Senha

```typescript
const handleCreateTicket = async () => {
    const newTicket = await addTicket(
        selectedServiceId,    // UUID do serviço
        'aposentado',         // Tipo de usuário
        isPriority            // true/false para prioritário
    );
    
    if (newTicket) {
        console.log(`Nova senha: ${newTicket.formatted_number}`);
        showNotification(`Senha gerada: ${newTicket.formatted_number}`);
    }
};
```

### Exemplo 2: Chamar Próxima Senha

```typescript
const handleCallNext = async () => {
    try {
        await callNextTicket(selectedServiceId);
        // A senha aparecerá em 'calledTicket'
        // Será automaticamente atualizada para 'in_progress' em 3 segundos
    } catch (error) {
        showError('Erro ao chamar senha');
    }
};
```

### Exemplo 3: Atualizar Status

```typescript
const handleFinishTicket = async (ticketId: string) => {
    await updateTicketStatus(
        ticketId,
        'completed',
        'Atendimento finalizado'  // Motivo (opcional)
    );
    // Dados serão atualizados automaticamente
};

const handleCancelTicket = async (ticketId: string) => {
    await updateTicketStatus(ticketId, 'cancelled');
};

const handleNoShow = async (ticketId: string) => {
    await updateTicketStatus(ticketId, 'no_show');
};
```

### Exemplo 4: Análise por Período

```typescript
const handleAnalyzePeriod = async () => {
    const startDate = new Date('2026-03-01');
    const endDate = new Date('2026-03-25');
    
    const results = await fetchTicketsByDateRange(startDate, endDate);
    
    // Calcular estatísticas
    const completed = results.filter(t => t.status === 'completed').length;
    const cancelled = results.filter(t => t.status === 'cancelled').length;
    const noShow = results.filter(t => t.status === 'no_show').length;
    
    console.log(`Período: ${completed} completed, ${cancelled} cancelled, ${noShow} no-show`);
};
```

### Exemplo 5: Listar Senhas com Filtro

```typescript
const PendingTickets = () => {
    const { todayTickets } = useTodayQueue();
    
    const pending = todayTickets.filter(t => t.status === 'waiting');
    const inProgress = todayTickets.filter(t => t.status === 'in_progress');
    
    return (
        <div>
            <h2>Aguardando ({pending.length})</h2>
            {pending.map(ticket => (
                <div key={ticket.id}>
                    {ticket.formatted_number} - {ticket.service?.name}
                </div>
            ))}
        </div>
    );
};
```

---

## 🔄 Fluxo de Dados em Tempo Real

```
┌─────────────────────────────────────────────────────────┐
│  Usuário Interage com Componente                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  useContext Hook chama função (ex: updateTicketStatus)  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase.from('tickets').update() executa             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Banco de dados PostgreSQL atualiza registro           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase Realtime emite mudança (postgres_changes)    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Contexto recebe evento e chama fetchTodayData()       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  setTodayTickets atualiza estado do React             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Componentes re-renderizam com novos dados             │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Tipos de Dados

```typescript
// Uma Senha
interface Ticket {
    id: string;                    // UUID
    number: number;                // 1, 2, 3...
    formatted_number: string;      // "APO-001"
    service_id: string;            // UUID do serviço
    service: Service | null;       // Dados do serviço
    user_type: UserType;           // 'aposentado' | 'pensionista' | 'servidor_ativo'
    status: TicketStatus;          // 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
    is_priority: boolean;          // Prioritário?
    operator_id?: string | null;   // Quem atendeu?
    created_at: string;            // ISO 8601
    started_at?: string | null;    // Quando começou
    completed_at?: string | null;  // Quando terminou
    updated_at?: string;           // Última atualização
}

// Um Serviço
interface Service {
    id: string;              // UUID
    name: string;            // "Prova de Vida"
    description: string;     // "Realização de prova de vida..."
    icon: string;            // "fingerprint"
    created_at: string;      // ISO 8601
}
```

---

## 🚨 Error Handling

```typescript
// Padrão de error handling com Supabase
const handleOperation = async () => {
    try {
        const { data, error } = await supabase
            .from('tickets')
            .select('*');
        
        if (error) {
            // Supabase retorna erro em 'error'
            console.error('Erro:', error.message);
            showNotification('Erro ao carregar dados', 'error');
            return;
        }
        
        // Sucesso!
        console.log('Dados:', data);
        showNotification('Dados carregados com sucesso');
    } catch (exception) {
        // Erro de rede ou parseJson
        console.error('Exceção:', exception);
        showNotification('Erro de conexão', 'error');
    }
};
```

---

## 📝 Adicionar Nova Funcionalidade

### Exemplo: Filtrar por Serviço

```typescript
// Em seu componente
const { todayTickets } = useTodayQueue();

const ticketsForService = (serviceId: string) => {
    return todayTickets.filter(t => t.service_id === serviceId);
};

// Usar assim:
const apoTickets = ticketsForService('a1b2c3d4-0001-4e5f-86a7-b8c9d0e1f2a3');
```

### Exemplo: Buscar Senha pelo Número

```typescript
const { todayTickets } = useTodayQueue();

const findTicket = (formattedNumber: string) => {
    return todayTickets.find(t => t.formatted_number === formattedNumber);
};

// Usar assim:
const ticket = findTicket('APO-005');
```

---

## ⚡ Performance Tips

1. **Use useMemo para dados filtrados**
   ```typescript
   const pending = useMemo(
       () => todayTickets.filter(t => t.status === 'waiting'),
       [todayTickets]
   );
   ```

2. **Não chame refresh em loop**
   ```typescript
   // ❌ Ruim
   useEffect(() => {
       refreshTodayTickets();  // Chamado a cada render!
   });
   
   // ✅ Bom
   useEffect(() => {
       refreshTodayTickets();
   }, []); // Apenas na montagem
   ```

3. **Use batch operations quando possível**
   ```typescript
   // ✅ Buscar dados relacionados em uma query
   const { data } = await supabase
       .from('tickets')
       .select(`
           *,
           service:service_id(*)
       `);
   ```

---

## 🔗 Documentação Oficial

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Queries](https://supabase.com/docs/guides/database)
- [Real-time](https://supabase.com/docs/guides/realtime)

---

**Feliz codificação!** 🚀
