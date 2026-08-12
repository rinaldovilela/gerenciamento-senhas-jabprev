# Autenticação Obrigatória para Geração de Senhas

**Data:** 2026-08-11
**Status:** Spec aprovada — pronta para plano de implementação
**Branch de origem:** `feature/update-frontend-restricted-area`

---

## 1. Objetivo

Garantir que uma senha de atendimento só possa ser emitida por um usuário autenticado no
sistema, independente do seu `role` (`user`, `operator` ou `admin`), impedindo que terceiros
gerem senhas em massa (flood) e poluam a fila do atendimento.

## 2. Contexto e problema

O fluxo atual de emissão de senha **não passa pelo backend**. O frontend chama o Supabase
diretamente com a chave anônima:

- `apps/frontend/src/features/queue/contexts/TodayQueueContext.tsx:253` — `supabase.rpc('create_ticket', ...)`

E o banco aceita essa chamada de qualquer origem:

- `supabase/migrations/20250326_complete_schema.sql:36` — policy de `INSERT` em `tickets` com `WITH CHECK (true)`
- A função `public.create_ticket` é `SECURITY INVOKER` e tem `EXECUTE` para `PUBLIC` (padrão do Postgres)

Consequência: qualquer pessoa com a URL do projeto e a anon key (que é pública por
natureza) emite senhas ilimitadas via `curl`, sem abrir o navegador.

A rota `POST /api/v1/queue/tickets` (`apps/backend/src/routes/queue.routes.ts:20`) **já está
protegida** por `authMiddleware` e sem restrição de role — exatamente o comportamento
desejado — mas é **código morto**: nada no frontend a consome. E se fosse consumida hoje,
falharia: `QueueService.createTicket` (`apps/backend/src/services/QueueService.ts:21-32`)
faz um `INSERT` direto sem `number` nem `formatted_number`, ambas colunas `NOT NULL`,
ignorando a RPC `create_ticket` (e portanto sem numeração, sem o advisory lock
anti-duplicidade e sem `attendee_name`).

**Conclusão:** um gate apenas no React seria barreira de UX, não de segurança. A exigência
precisa existir no servidor.

## 3. Decisão

Rotear a emissão de senha pela rota de backend que já existe e já valida o token, e fechar
o acesso direto do navegador ao banco para operações de escrita em `tickets`.

Alternativa considerada e descartada: assinar o JWT do login no formato do Supabase
(`role: 'authenticated'`) e exigir isso no RLS. É elegante e mantém a emissão direta no
Supabase, mas depende de o projeto ainda expor o *legacy JWT secret* (HS256) e altera o
caminho de login, que é vivo para todos os usuários. A opção escolhida mexe em menos
código em produção.

## 4. Escopo

### 4.1 Backend

| Arquivo | Mudança |
|---|---|
| `apps/backend/src/services/QueueService.ts` | `createTicket` passa a chamar `supabase.rpc('create_ticket', { p_service_id, p_user_type, p_is_priority, p_attendee_name })`. Retorna a **linha crua** do ticket (o totem precisa de `number` e `formatted_number`, que o `mapToTicket` atual descarta). |
| `apps/backend/src/controllers/queueController.ts` | Repassar o payload real e registrar em log quem emitiu (`req.user.id`) |
| `apps/backend/src/routes/queue.routes.ts` | `createTicketSchema` do Joi com o payload real |

`authMiddleware` permanece **inalterado** — sem `operatorOnlyMiddleware`, qualquer role
autenticado emite senha. `listTickets`, `getTicket`, `updateTicket` e `deleteTicket` não são
tocados (seguem sem uso).

**Contrato da rota:**

```
POST /api/v1/queue/tickets
Authorization: Bearer <jwt>

body:
{
  "serviceId":    "<uuid>",                                          // obrigatório
  "userType":     "aposentado" | "pensionista" | "servidor_ativo",   // obrigatório
  "isPriority":   boolean,                                           // default false
  "attendeeName": "<string>"                                         // opcional
}

201 → linha do ticket: { id, number, formatted_number, attendee_name,
                         service_id, user_type, status, is_priority, created_at, ... }
400 → falha de validação (Joi)
401 → { "error": "No authorization token" } | { "error": "Invalid or expired token" }
```

Auditoria de quem emitiu fica em log de aplicação. A coluna `tickets.operator_id` **não** é
preenchida na criação: ela representa quem *atendeu*, e a RPC não a recebe.

### 4.2 Banco de dados

Nova migration em `supabase/migrations/`, no padrão de nome datado do projeto:
`20260811120000_lock_create_ticket_to_backend.sql`

```sql
-- Só o backend (service_role) pode criar senha
REVOKE EXECUTE ON FUNCTION public.create_ticket(uuid, public.user_type, boolean, text)
  FROM anon, authenticated, public;
GRANT  EXECUTE ON FUNCTION public.create_ticket(uuid, public.user_type, boolean, text)
  TO service_role;

-- Fecha também o INSERT direto na tabela, senão dá para pular a RPC
DROP POLICY IF EXISTS "Users can create their own tickets." ON public.tickets;
CREATE POLICY "Only backend can create tickets"
  ON public.tickets FOR INSERT TO service_role WITH CHECK (true);
```

As duas partes são necessárias: revogar apenas a RPC deixaria `POST /rest/v1/tickets`
aberto. Nenhuma policy de `SELECT` é alterada.

### 4.3 Frontend

| Arquivo | Mudança |
|---|---|
| `apps/frontend/src/features/auth/components/LoginModal.tsx` | **[NOVO]** Modal de login sobreposto. Segue o padrão de `ConfirmationModal.tsx` (Tailwind, `if (!isOpen) return null`). Reusa `useAuth().login` e o mesmo schema zod de `LoginScreen.tsx:14`. Props: `isOpen`, `onClose`, `onSuccess`, `message?`. |
| `apps/frontend/src/features/auth/components/index.ts` | Export do novo componente |
| `apps/frontend/src/App.tsx` | Gate de sessão + renderização do modal + tratamento de 401 |
| `apps/frontend/src/features/queue/contexts/TodayQueueContext.tsx` | `addTicket` chama `ApiClient.createTicket(...)` e **propaga** o erro |
| `apps/frontend/src/lib/api.ts` | Assinatura de `createTicket` com o payload real |

**Gate de sessão — cobre o modo totem.** O gate não pode ficar só no `handleStart()`: em
fullscreen o `requestFullscreen()` (`App.tsx:70`) vai direto para
`Screen.USER_TYPE_SELECTION`, e após emitir uma senha o `handleNewTicketRequest()`
(`App.tsx:172`) também. Nos dois casos o `handleStart` é ignorado. Solução — um helper
único no `AppContent`, usado em `handleStart` **e** em `requestFullscreen`:

```typescript
const requireAuth = useCallback((next: () => void) => {
    if (isAuthenticated) { next(); return; }
    setPendingAction(() => next);   // wrapper obrigatório: useState trata função como updater
    setIsLoginModalOpen(true);
}, [isAuthenticated]);
```

Como o token persiste em `localStorage` e é restaurado no boot
(`AuthContext.tsx:41-77`), o operador loga **uma vez por turno** e o loop do totem
(senha → nova senha → senha) roda sem reabrir o modal.

**Sessão expirada no meio do expediente.** `JWT_EXPIRY` é 24h. Quando o `addTicket`
receber 401, o `App.tsx` reabre o `LoginModal` com mensagem de sessão expirada,
preservando serviço / tipo / prioridade já escolhidos, e reexecuta a emissão após o
login bem-sucedido. Sem refresh token, sem logout por inatividade.

`addTicket` hoje engole qualquer erro e retorna `null` (`TodayQueueContext.tsx:288-291`),
o que impede distinguir 401 de falha de rede. Passa a propagar o `ApiError` — o único
consumidor é `App.tsx:150`. O mapeamento do objeto `Ticket` permanece igual.

## 5. O que não muda (anti-regressão)

O sistema funciona hoje e nada abaixo é tocado:

- **Painel da TV** (`PublicDisplayScreen`) e `fetchTodayData` — são `SELECT`, cujas policies
  permanecem `using (true)`. Continuam funcionando **sem login**.
- **`updateTicketStatus`** (chamar / concluir / cancelar senha pelo operador) — segue direto
  no Supabase, sem alteração.
- **Login, `AuthContext`, `authMiddleware`, formato do JWT** — inalterados.
- **Realtime / WebSocket** — inalterados.
- **Layout do totem** — inalterado; o modal apenas se sobrepõe.
- **`ServiceManagementScreen`, `UserManagementScreen`, métricas, relatórios** — inalterados.

## 6. Ordem de deploy (importante)

A migration quebra o frontend antigo. A ordem correta é:

1. Deploy do **backend** (rota passa a funcionar; nada quebra, era código morto)
2. Deploy do **frontend** (passa a usar a rota)
3. **Migration** por último (fecha o acesso direto)

Invertendo 2 e 3, o totem em produção para de emitir senha até o frontend subir.

**Rollback:** reverter na ordem inversa. Um `GRANT EXECUTE ... TO anon` + recriar a policy
de `INSERT` antiga restaura o comportamento atual sem redeploy.

## 7. Verificação

O projeto não possui runner de testes configurado (sem Vitest/Jest nas dependências).
Adicionar um está fora do escopo desta mudança; a verificação é manual.

### Fluxo (do plano original)

1. Abrir o totem deslogado → clicar em "Iniciar Atendimento" → **modal aparece, fluxo não avança**
2. Credenciais inválidas → **erro no modal, fluxo bloqueado**
3. Credenciais válidas → **modal fecha e segue para seleção de tipo de usuário**
4. Concluir o fluxo → **senha emitida com numeração correta (`APO-001`, `PRIO-001`, ...)**
5. Emitir uma segunda senha seguida → **numeração incrementa, sem duplicidade**
6. Entrar em **fullscreen** deslogado → **modal aparece** (cobre o caminho do totem)
7. Já logado, emitir senha → **modal não reaparece**

### Segurança (prova de que o furo fechou)

8. `curl` na RPC `create_ticket` do Supabase com a anon key → **permission denied**
9. `curl -X POST /api/v1/queue/tickets` sem header `Authorization` → **401**
10. `curl -X POST /rest/v1/tickets` (insert direto) com a anon key → **negado pelo RLS**

### Não-regressão

11. Painel da TV em aba anônima, **sem login** → **continua atualizando em tempo real**
12. Operador chama e conclui uma senha → **funciona como antes**

## 8. Riscos e pré-checagens

| Risco | Avaliação |
|---|---|
| Backend hibernando (Render free tier) atrasa a primeira senha do dia | Não é dependência nova: o login já passa pelo backend, então o operador já percebe isso ao logar. |
| `CORS_ORIGIN` não configurado em produção | `config/server.ts:9` lê `CORS_ORIGIN`, mas os guias de deploy mandam definir `FRONTEND_URL`, que o código ignora (default: `http://localhost:5173`). Se o login funciona hoje em produção, a origem está liberada e a emissão usa o mesmo `ApiClient` — sem risco novo. **Confirmar antes do deploy.** |
| Token expira com o totem ligado | Coberto pela reabertura automática do modal (seção 4.3). |

## 9. Fora de escopo

Itens identificados durante a análise, deliberadamente não tratados aqui:

- Rate limiting (`express-rate-limit`) em `/auth/login` — o gate de autenticação já resolve o
  flood; brute force de senha é problema distinto
- `POST /auth/register` público e login que não valida `status` (`inactive` / `blocked`)
- `POST /auth/refresh` aceitando access token como refresh token
- Policies permissivas em `services` e no `UPDATE` de `tickets`
- Pasta de migrations duplicada e divergente em
  `apps/frontend/src/lib/supabase/migrations/` (é onde vive o `0004`, que abriu o `UPDATE`
  público). Migrations novas vão **somente** em `supabase/migrations/`
- Arquivos residuais: `apps/backend/src/config.ts.bak`, `apps/backend/scratch_schema_discover.ts`
