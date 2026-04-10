# Sheet de Requisitos Contemplados

Data de referencia: 2026-04-10

## Escopo

Esta planilha sintetiza os requisitos funcionais e nao funcionais ja contemplados no sistema, com base na estrutura atual do repositorio e na documentacao existente.

## Requisitos funcionais

| ID | Requisito | Status | Evidencia principal |
|---|---|---|---|
| RF-01 | Autenticacao de usuarios do sistema | Contemplado | `apps/backend/src/controllers/authController.ts` |
| RF-02 | Gerenciamento de fila (emissao e acompanhamento de senha) | Contemplado | `apps/backend/src/controllers/queueController.ts` |
| RF-03 | Painel de atendimento/operacao | Contemplado | `apps/frontend/src/features/queue/components` |
| RF-04 | Atualizacao em tempo real (realtime) | Contemplado | `apps/backend/src/websocket` |
| RF-05 | Integracao com Supabase para persistencia | Contemplado | `apps/backend/src/supabase.ts`, `supabase/migrations` |
| RF-06 | Painel/fluxos administrativos | Parcialmente contemplado | `apps/backend/src/controllers/adminController.ts` |

## Requisitos nao funcionais

| ID | Requisito | Status | Evidencia principal |
|---|---|---|---|
| RNF-01 | Organizacao modular front/back | Contemplado | Estrutura `apps/frontend` e `apps/backend` |
| RNF-02 | Rastreabilidade de mudancas de banco | Contemplado | `supabase/migrations` |
| RNF-03 | Documentacao centralizada | Contemplado | `docs/README.md` e subpastas |
| RNF-04 | Padrao de execucao local | Contemplado | `package.json` na raiz |
| RNF-05 | Controle de artefatos/segredos no git | Contemplado | `.gitignore` |
| RNF-06 | Padrao de qualidade automatizado (CI) | Nao contemplado | Sem pipeline CI versionado |

## Requisitos institucionais (orgao publico)

| ID | Requisito | Status | Observacao |
|---|---|---|---|
| RG-01 | Segregacao de responsabilidades tecnicas | Contemplado | Separacao formal front/back |
| RG-02 | Base documental para auditoria interna | Contemplado | Historico e checklists em `docs/` |
| RG-03 | Procedimento formal de continuidade operacional | Parcialmente contemplado | Guias existem, falta runbook unico de incidente |
| RG-04 | Evidencia de testes e validacao recorrente | Parcialmente contemplado | Existem artefatos, falta politica periodica consolidada |

## Pendencias de baixo esforco

1. Consolidar um unico runbook de contingencia operacional.
2. Definir criterios minimos para homologacao por release.
3. Implantar CI para build + typecheck + smoke test.
