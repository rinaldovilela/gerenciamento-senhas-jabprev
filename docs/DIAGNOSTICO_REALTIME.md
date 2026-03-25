# 🔍 Diagnóstico de Real-time no Supabase

## Problema Atual
O listener está recebendo UPDATE com sucesso no Supabase, mas **não está vendo eventos em tempo real** (não há `⚡ EVENTO RECEBIDO` nos logs).

## Causas Possíveis

| Causa | Sintoma | Solução |
|-------|---------|---------|
| **Realtime desabilitado** | Sem eventos chegando ao listener | Ativar em Supabase Dashboard > Settings > Realtime |
| **Tabelas não na publicação** | UPDATE funciona mas sem eventos | Adicionen em `supabase_realtime` publication |
| **Replica identity incorreta** | Eventos incompletos | Deve ser FULL |
| **RLS bloqueando eventos** | Alguns usuários não recebem | Verificar policies de SELECT |

## 🧪 Como Testar (3 passos)

### Passo 1: Verificar Configuração no Supabase
1. Acesse: https://app.supabase.com/project/vrxlaphgwzmtwoweecjp/sql
2. Copie o conteúdo de `supabase/test-realtime.sql`
3. Cole e execute cada query uma por uma
4. **Procure por:**
   - ✅ `supabase_realtime` publication existe
   - ✅ `tickets` e `services` estão na publication
   - ✅ `replica_identity` = `FULL`
   - ✅ `wal_level` = `logical`

### Passo 2: Testar com Update Manual
1. Execute a query `UPDATE public.tickets SET status = 'in_progress'...`
2. **Ao mesmo tempo**, abra o console da aplicação (F12)
3. **Você deve ver nos logs:**
   ```
   ⚡ EVENTO RECEBIDO: {
     tipo: 'UPDATE',
     ticketId: 'xxx-xxx',
     ...
   }
   ```

**Se VER o evento** → Real-time está funcionando! Problema é na UI

**Se NÃO VER** → Real-time não está ativado

### Passo 3: Testar via UI
1. Abra http://localhost:5173 (aplicação)
2. Abra DevTools Console (F12)
3. Clique em "Iniciar Atendimento"
4. **Procure pelos logs:**
   - `[TodayQueueContext] ⚡ EVENTO RECEBIDO` ← Deve aparecer
   - `[TodayQueueContext] ✅ Atualizando ticket localmente` ← Deve aparecer
   - Status na tabela muda automaticamente ← Deve acontecer

## 📋 Checklist de Diagnóstico

```
[ ] Realtime está ativado no Supabase Dashboard
[ ] Tabelas tickets e services estão na publicação supabase_realtime
[ ] Replica identity è FULL para ambas as tabelas
[ ] WAL level é 'logical'
[ ] Anon user tem permissão SELECT
[ ] RLS: política de SELECT permite anon (true)
[ ] RLS: política de UPDATE permite auth.role()='authenticated'
```

## ⚠️ Se Real-time AINDA não funcionar

Se após testar tudo acima a real-time ainda não funcionar, as alternativas são:

### Opção A: Polling (Solução Rápida)
Fazer refetch a cada 2-3 segundos em vez de depender de real-time:
```typescript
setInterval(() => {
  fetchTodayData(); // Refetch data
}, 3000);
```

### Opção B: Backend Dedicado (Solução Robusta)
Criar um servidor Node.js/Python que:
- Escuta eventos de real-time do Supabase
- Propaga via WebSocket para a aplicação
- Pode ser hospedado no Render (grátis)

### Opção C: HTTP Polling via API (Solução Intermediária)
Criar API que apenas retorna dados novos desde última atualização (mais eficiente que refetch completo)

## Próximos Passos

1. **Execute `test-realtime.sql` no SQL Editor do Supabase**
2. **Lance a aplicação e teste via UI**
3. **Compartilhe os resultados dos 3 passos acima**
4. Com base nos resultados, podemos:
   - Ativar real-time se desabilitado
   - Implementar polling se real-time não funcionar
   - Criar backend se precisar de mais performance
