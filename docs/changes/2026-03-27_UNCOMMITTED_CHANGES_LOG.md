# Registro de Alteracoes Nao Commitadas - 2026-03-27

## Resumo

Este documento consolida, em ordem cronologica, as alteracoes realizadas e ainda nao commitadas no repositorio.

## 1. Alinhamento JWT e protecoes de rota (Backend + Frontend)

- Migracao de autenticacao no frontend para JWT do backend.
- Ajustes de role para padrao `user | operator | admin`.
- Protecao explicita de rotas sensiveis com `authMiddleware` + middlewares de permissao.
- Validacao de variaveis obrigatorias de ambiente com inclusao de `JWT_SECRET`.

Arquivos principais:
- `src/features/auth/contexts/AuthContext.tsx`
- `src/features/auth/components/LoginScreen.tsx`
- `src/features/queue/components/RestrictedArea.tsx`
- `src/shared/types/database.ts`
- `backend/src/routes/index.ts`
- `backend/src/config/environment.ts`

## 2. Ajustes estruturais em QueueService (compatibilidade schema atual)

- Mapeamento de campos para `service_id`, `is_priority`, `operator_id`.
- Ajustes de update de status para usar campos atuais.
- Tratamento de retorno vazio/listagem defensiva e logs de erro.

Arquivo principal:
- `backend/src/services/QueueService.ts`

## 3. Automacao de smoke test JWT

- Inclusao de collection e environment Postman para smoke JWT.
- Geracao de relatorio de execucao Newman.

Arquivos:
- `scripts/postman/jwt-smoke.postman_collection.json`
- `scripts/postman/local.postman_environment.json`
- `scripts/postman/jwt-smoke-result.json`
- `scripts/smoke-auth-results.json`

## 4. Cadastro interno via script

- Script PowerShell para cadastro de usuarios internos por role.
- Suporte para cadastro via `/auth/register` (role `user`) e `/admin/users` (`operator`/`admin` com token admin).

Arquivo:
- `scripts/create-user.ps1`

## 5. Fluxo de senha com nome da pessoa atendida

- Nova etapa de UI apos selecao de servico para informar nome da pessoa.
- Persistencia do nome no ticket via RPC `create_ticket`.
- Exibicao do nome na tela de senha e no painel publico (TV).

Arquivos principais:
- `src/App.tsx`
- `src/features/queue/components/NameInputScreen.tsx`
- `src/features/queue/components/index.ts`
- `src/features/queue/components/TicketScreen.tsx`
- `src/features/queue/components/PublicDisplayScreen.tsx`
- `src/features/queue/contexts/TodayQueueContext.tsx`
- `src/features/queue/contexts/QueueContext.tsx`
- `src/shared/types/database.ts`

## 6. Migracao de banco para attendee_name

- Inclusao da coluna `attendee_name` em `public.tickets`.
- Atualizacao da funcao `public.create_ticket` com parametro `p_attendee_name`.

Arquivo:
- `supabase/migrations/20260327153000_ticket_attendee_name.sql`

Status de execucao:
- Aplicada no remoto via `supabase db push --include-all`.

## 7. Correcao de CORS e mensagem de erro de login

- CORS ajustado para lista de origens valida (uma origem por resposta).
- Mensagem tecnica `Failed to fetch` substituida por mensagem amigavel ao usuario.

Arquivos:
- `backend/src/config/server.ts`
- `src/features/auth/contexts/AuthContext.tsx`

## 8. Correcao de conflito FK em inicio de atendimento

- Identificado conflito de FK em `tickets.operator_id` em ambientes legados.
- Inclusao de fallback defensivo no frontend para update de status sem interromper atendimento em caso de conflito de `operator_id`.
- Criada migracao defensiva para normalizar FK de `tickets.operator_id` para `public.users(id)`.

Arquivos:
- `src/features/queue/contexts/TodayQueueContext.tsx`
- `supabase/migrations/20260327170000_fix_tickets_operator_fk_jwt.sql`

Status de execucao:
- Aplicada no remoto via `supabase db push --include-all`.

## 9. Estado atual de migracoes (local vs remoto)

Migracoes sincronizadas no remoto:
- `20250326`
- `20260326170000`
- `20260327113000`
- `20260327153000`
- `20260327170000`

## 10. Pendencias para commit

Arquivos novos nao commitados:
- `docs/changes/2026-03-27_UNCOMMITTED_CHANGES_LOG.md`
- `scripts/create-user.ps1`
- `src/features/queue/components/NameInputScreen.tsx`
- `supabase/migrations/20260327153000_ticket_attendee_name.sql`
- `supabase/migrations/20260327170000_fix_tickets_operator_fk_jwt.sql`
- `scripts/postman/jwt-smoke.postman_collection.json`
- `scripts/postman/local.postman_environment.json`
- `scripts/postman/jwt-smoke-result.json`
- `scripts/smoke-auth-results.json`

Arquivos alterados nao commitados (principais):
- `backend/src/config/server.ts`
- `backend/src/config/environment.ts`
- `backend/src/routes/index.ts`
- `backend/src/services/QueueService.ts`
- `src/App.tsx`
- `src/features/auth/components/LoginScreen.tsx`
- `src/features/auth/contexts/AuthContext.tsx`
- `src/features/queue/components/PublicDisplayScreen.tsx`
- `src/features/queue/components/TicketScreen.tsx`
- `src/features/queue/components/RestrictedArea.tsx`
- `src/features/queue/components/index.ts`
- `src/features/queue/contexts/QueueContext.tsx`
- `src/features/queue/contexts/TodayQueueContext.tsx`
- `src/shared/types/database.ts`

