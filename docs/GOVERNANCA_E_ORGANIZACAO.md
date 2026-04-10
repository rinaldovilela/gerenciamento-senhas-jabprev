# Governanca e Organizacao do Repositorio

Data de referencia: 2026-04-10

## Objetivo

Padronizar a estrutura tecnica e documental para operacao em contexto de orgao publico, com foco em rastreabilidade, previsibilidade operacional e baixo risco de manutencao.

## Estrutura oficial

```
apps/
  backend/     # API, regras de negocio, websocket, integracao com Supabase
  frontend/    # Interface web para operadores e exibicao publica

docs/          # Requisitos, arquitetura, checklists, auditorias e guias operacionais
scripts/       # Scripts operacionais e de suporte (PowerShell/Postman)
supabase/      # Configuracao e migracoes SQL
```

## Convencoes adotadas

1. Separacao por responsabilidade
- Frontend e backend em pastas distintas dentro de `apps/`.
- Nenhuma regra de negocio critica deve viver apenas no frontend.

2. Documentacao em camadas
- `docs/README.md`: indice de navegacao.
- Documentos de governanca: diretrizes atemporais.
- Documentos datados: historico de mudancas, auditorias e checkpoints.

3. Execucao local padronizada
- Frontend: `npm run dev:frontend`
- Backend: `npm run dev:backend`
- Build geral: `npm run build`

4. Seguranca e conformidade basica
- Arquivos de ambiente e segredos devem permanecer fora do versionamento.
- Logs, artefatos de build e dependencias locais nao devem ser comitados.

## Responsabilidades por modulo

- `apps/backend`: autenticacao, autorizacao, filas, API e eventos realtime.
- `apps/frontend`: experiencia do operador, painel de atendimento e visualizacao.
- `supabase/migrations`: rastreabilidade de alteracoes de schema e regras no banco.

## Politica de mudanca minima

Para reduzir risco operacional:

1. Toda alteracao estrutural deve atualizar este documento e o `README.md` da raiz.
2. Toda alteracao funcional deve atualizar a planilha em `REQUISITOS_CONTEMPLADOS.md`.
3. Mudancas visuais relevantes devem atualizar `IDENTIDADE_VISUAL.md`.

## Proximos ajustes recomendados (curto prazo)

1. Consolidar contextos legados duplicados no frontend.
2. Criar `apps/frontend/.env.example` e `apps/backend/.env.example`.
3. Adicionar pipeline CI com build e smoke test.
