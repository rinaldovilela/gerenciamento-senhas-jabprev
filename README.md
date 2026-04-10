# Sistema de Gerenciamento de Filas - JABPREV

Monorepo simples para operacao de fila em ambiente institucional/publico, com separacao explicita entre frontend e backend.

## Estrutura

```
apps/
  frontend/   # React + Vite
  backend/    # Node.js + Express + Socket.IO
docs/         # Documentacao funcional, tecnica e governanca
scripts/      # Scripts operacionais e de apoio
supabase/     # Configuracoes e migracoes
```

## Como executar

Pre-requisito: Node.js 20+

1. Instale dependencias por app:
   - `npm install --prefix apps/frontend`
   - `npm install --prefix apps/backend`
2. Rode o frontend:
   - `npm run dev:frontend`
3. Rode o backend:
   - `npm run dev:backend`

## Scripts da raiz

- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build`
- `npm run build:frontend`
- `npm run build:backend`
- `npm run typecheck`

## Documentacao

- Indice geral: [docs/README.md](docs/README.md)
- Organizacao e governanca: [docs/GOVERNANCA_E_ORGANIZACAO.md](docs/GOVERNANCA_E_ORGANIZACAO.md)
- Planilha de requisitos contemplados: [docs/REQUISITOS_CONTEMPLADOS.md](docs/REQUISITOS_CONTEMPLADOS.md)
- Guia de identidade visual: [docs/IDENTIDADE_VISUAL.md](docs/IDENTIDADE_VISUAL.md)
- Runbook de incidente e continuidade: [docs/RUNBOOK_CONTINUIDADE_OPERACIONAL.md](docs/RUNBOOK_CONTINUIDADE_OPERACIONAL.md)
