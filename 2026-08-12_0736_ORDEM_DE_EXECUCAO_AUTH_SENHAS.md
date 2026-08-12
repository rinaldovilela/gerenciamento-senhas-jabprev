# Ordem de Execução — Autenticação Obrigatória para Geração de Senhas

**Gerado em:** 2026-08-12 07:36
**Spec:** `docs/plans/2026-08-11_2214_AUTH_OBRIGATORIA_GERACAO_SENHA.md`
**Backup dos dados:** `Desktop\JABOATAO PREV\backups-jabprev\2026-08-11_2233\` (fora do repositório)

> **A ordem importa.** Se a migration (Passo 3) rodar antes do frontend novo estar no ar,
> o totem para de emitir senha até o frontend subir.
>
> **Ordem correta: backend → frontend → migration.**

---

## Passo 0 — Pré-checagens (antes de subir qualquer coisa)

Confirme que a emissão de senha vai conseguir falar com a API, porque **antes** ela nem
usava a API e agora depende dela.

- [ ] **Frontend em produção tem `VITE_API_URL`** apontando para o backend
      (ex.: `https://jabprev-queue-backend.onrender.com`). Se estiver vazio, o build cai no
      default `http://localhost:3001` e o totem não emite senha.
- [ ] **Backend em produção tem `CORS_ORIGIN`** com a URL do frontend.
      Atenção: o código lê `CORS_ORIGIN` (`apps/backend/src/config/server.ts:9`), mas os
      guias antigos mandavam preencher `FRONTEND_URL`, que o código **ignora**.
      Se só existir `FRONTEND_URL`, crie `CORS_ORIGIN` com o mesmo valor.
- [ ] **Login em produção funciona hoje?** Abra a Área Restrita e faça login.
      Se o login funciona, a API está acessível e o CORS está ok — é o mesmo caminho que a
      emissão de senha vai usar. **Se o login não funciona, resolva isso antes de continuar.**
- [ ] Confirme que existe pelo menos um usuário ativo para o atendente usar no totem.

---

## Passo 1 — Deploy do BACKEND

Suba `apps/backend` (Render). Arquivos alterados:

- `src/services/QueueService.ts`
- `src/controllers/queueController.ts`
- `src/routes/queue.routes.ts`

**Não quebra nada:** a rota `POST /api/v1/queue/tickets` era código morto (e estava
quebrada). Nenhum cliente a usava antes deste deploy.

Validar depois de subir:

```bash
# 1) servidor no ar
curl -i https://SEU-BACKEND/health
# esperado: HTTP 200 {"status":"ok",...}

# 2) rota protegida (sem token)
curl -i -X POST https://SEU-BACKEND/api/v1/queue/tickets \
  -H "Content-Type: application/json" \
  -d '{"serviceId":"a1b2c3d4-0001-4e5f-86a7-b8c9d0e1f2a3","userType":"aposentado","isPriority":false}'
# esperado: HTTP 401 {"error":"No authorization token"}
```

- [ ] `/health` retorna 200
- [ ] POST sem token retorna **401**

---

## Passo 2 — Deploy do FRONTEND

Suba `apps/frontend`. Arquivos alterados:

- `src/features/auth/components/LoginModal.tsx` (novo)
- `src/features/auth/components/index.ts`
- `src/App.tsx`
- `src/features/queue/contexts/TodayQueueContext.tsx`
- `src/lib/api.ts`

Depois do deploy, **hard refresh** (`Ctrl+Shift+R`) em:

- [ ] Totem / tela de autoatendimento
- [ ] Painel da TV
- [ ] Máquina do atendimento

> Navegador em modo kiosk com bundle antigo em cache continua chamando o Supabase direto
> e, depois do Passo 3, vai receber erro de permissão. Não é bug — é cache.

Validar (a essa altura o login já é exigido, mas o furo do flood ainda está aberto):

- [ ] Deslogado, clicar em "Iniciar Atendimento" → **modal de login aparece**
- [ ] Credenciais erradas → **erro no modal, não avança**
- [ ] Credenciais certas → **modal fecha e segue para seleção de tipo de usuário**
- [ ] Emitir uma senha → **sai com numeração correta** (`APO-001`, `PRIO-001`, ...)
- [ ] Emitir a segunda senha seguida → **número incrementa, sem duplicidade**
- [ ] Entrar em **tela cheia** deslogado → **modal aparece** (caminho do totem)
- [ ] Já logado → **modal não reaparece** no loop de emissão

---

## Passo 3 — MIGRATION (por último)

Supabase Dashboard → **SQL Editor** → **New query** → cole o SQL abaixo → **Run**.

Arquivo de origem: `supabase/migrations/20260811223300_lock_create_ticket_to_backend.sql`

```sql
-- 1. Somente o backend pode executar a funcao de emissao.
REVOKE EXECUTE ON FUNCTION public.create_ticket(uuid, public.user_type, boolean, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_ticket(uuid, public.user_type, boolean, text)
  TO service_role;

-- 2. Revoga o INSERT direto na tabela (senao daria para pular a funcao).
REVOKE INSERT ON public.tickets FROM anon, authenticated;

-- 3. Substitui a policy permissiva de INSERT.
DROP POLICY IF EXISTS "Users can create their own tickets." ON public.tickets;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tickets'
      AND policyname = 'Only backend can create tickets'
  ) THEN
    CREATE POLICY "Only backend can create tickets"
      ON public.tickets
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;
```

- [ ] Rodou sem erro

---

## Passo 4 — Verificação final

### Prova de que o flood fechou

```bash
# A) emitir senha direto pelo Supabase com a anon key -> deve FALHAR
curl -i -X POST "https://SEU-PROJETO.supabase.co/rest/v1/rpc/create_ticket" \
  -H "apikey: SUA_ANON_KEY" \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"p_service_id":"a1b2c3d4-0001-4e5f-86a7-b8c9d0e1f2a3","p_user_type":"aposentado","p_is_priority":false,"p_attendee_name":null}'
# esperado: 401/403 com "permission denied for function create_ticket"

# B) insert direto na tabela com a anon key -> deve FALHAR
curl -i -X POST "https://SEU-PROJETO.supabase.co/rest/v1/tickets" \
  -H "apikey: SUA_ANON_KEY" \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"number":9999,"formatted_number":"HACK-999","service_id":"a1b2c3d4-0001-4e5f-86a7-b8c9d0e1f2a3","user_type":"aposentado","is_priority":false,"status":"waiting"}'
# esperado: 401/403 (permission denied / RLS)
```

- [ ] (A) negado
- [ ] (B) negado

### Prova de que nada regrediu

- [ ] **Painel da TV em aba anônima, sem login** → continua atualizando em tempo real
- [ ] Emitir senha pelo totem logado → **funciona**
- [ ] Operador **chama** a próxima senha → funciona
- [ ] Operador **conclui / cancela** senha → funciona
- [ ] Acompanhamento de senhas do dia carrega normalmente
- [ ] Área Restrita, métricas e gestão de serviços/usuários funcionando

---

## Rollback (se algo der errado)

Ordem inversa. O rollback do banco não exige redeploy:

```sql
GRANT EXECUTE ON FUNCTION public.create_ticket(uuid, public.user_type, boolean, text)
  TO anon, authenticated;
GRANT INSERT ON public.tickets TO anon, authenticated;
DROP POLICY IF EXISTS "Only backend can create tickets" ON public.tickets;
CREATE POLICY "Users can create their own tickets."
  ON public.tickets FOR INSERT WITH CHECK (true);
```

Depois, se necessário, redeploy do frontend e do backend na versão anterior.

**Restaurar dados** (só se houver perda — improvável, a mudança não toca em dados):
instruções em `backups-jabprev\2026-08-11_2233\LEIA-ME.md` (upsert via REST).

---

## Observações

- **Sessão do atendente:** o token dura 24h e persiste no navegador. Na prática, um login por
  dia. Se expirar no meio do expediente, o modal reabre sozinho pedindo login e a senha é
  emitida em seguida, preservando serviço / tipo / prioridade já escolhidos.
- **Primeira senha do dia pode demorar** se o backend do Render estiver hibernando (plano
  free). Não é novo: o login já passava pelo backend.
- **Atenção com a migration `20260327113000_queue_bootstrap_if_missing.sql`**: ela recria a
  policy permissiva de INSERT se não existir. Por isso o `REVOKE INSERT` do Passo 3 é a
  proteção durável — mesmo que a policy volte, sem o GRANT o insert continua bloqueado.
- **Ponto pendente fora deste escopo:** a chave `service_role` está commitada em
  `docs/DEPLOY_RENDER.md`, `docs/DEPLOY_RENDER_DASHBOARD.md` e `docs/setup/SUPABASE_SETUP.md`,
  e o repositório é público. Nada nesta mudança protege contra isso — quem tem essa chave
  ignora todo o RLS. Tratar em outro momento.
