# Identidade Visual (Guia Enxuto)

Data de referencia: 2026-04-10

## Objetivo

Estabelecer um padrao visual institucional, claro e consistente, adequado ao contexto de servico publico, sem excesso de complexidade.

## Principios de interface

1. Clareza operacional
- Priorizar legibilidade para atendimento presencial.
- Reduzir ambiguidades em botoes, estados e mensagens.

2. Sobriedade institucional
- Evitar exagero cromatico e efeitos visuais desnecessarios.
- Preferir contraste alto e hierarquia tipografica objetiva.

3. Acessibilidade pratica
- Contraste minimo WCAG AA.
- Componentes acionaveis com area de toque adequada.
- Estados de foco visivel para uso por teclado.

## Diretriz de paleta

Sugestao base para padronizacao institucional:

- Primaria: `#0B3D91` (azul institucional)
- Primaria escura: `#072B66`
- Secundaria: `#0F766E` (apoio)
- Fundo base: `#F5F7FA`
- Superficie: `#FFFFFF`
- Texto principal: `#0F172A`
- Sucesso: `#166534`
- Alerta: `#B45309`
- Erro: `#B91C1C`

## Tipografia

- Fonte principal: `Source Sans 3` (boa leitura em ambientes administrativos).
- Fallback: `Segoe UI`, `Arial`, sans-serif.
- Escala enxuta:
  - Titulo principal: 28-32px
  - Titulo de secao: 20-24px
  - Texto comum: 16px
  - Legenda/apoio: 14px

## Componentes criticos

1. Senha atual e proximas chamadas
- Alto contraste, tamanho ampliado e destaque central.

2. Status de atendimento
- Cores semaforicas com reforco textual (nao depender apenas de cor).

3. Acoes de operador
- Botoes com rotulos diretos: "Chamar", "Finalizar", "Ausente", "Rechamar".

## Tokens recomendados (frontend)

Criar e manter em `apps/frontend/src/styles/global.css`:

```css
:root {
  --color-primary: #0B3D91;
  --color-primary-700: #072B66;
  --color-secondary: #0F766E;
  --color-bg: #F5F7FA;
  --color-surface: #FFFFFF;
  --color-text: #0F172A;
  --color-success: #166534;
  --color-warning: #B45309;
  --color-error: #B91C1C;
}
```

## Aplicacao minima esperada

1. Cabechalhos e botoes primarios usando `--color-primary`.
2. Texto sempre com contraste adequado sobre fundo.
3. Estados de sucesso/alerta/erro padronizados pelos tokens.
