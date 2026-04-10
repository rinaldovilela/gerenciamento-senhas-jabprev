# Runbook Unico de Incidente e Continuidade Operacional

Data de referencia: 2026-04-10
Escopo: Sistema de Gerenciamento de Filas JABPREV

## 1. Objetivo

Estabelecer um procedimento unico, padronizado e auditavel para resposta a incidentes e restauracao de operacao, com foco em continuidade do atendimento ao cidadao.

## 2. Classificacao de incidente

- Severidade Alta (SEV-1)
  - Sistema indisponivel para emissao/chamada de senhas
  - Falha de autenticacao generalizada
  - Perda de dados operacionais do dia

- Severidade Media (SEV-2)
  - Funcionalidade critica degradada com alternativa manual
  - Erro intermitente em painel de atendimento

- Severidade Baixa (SEV-3)
  - Erros nao criticos sem impacto no atendimento principal

## 3. Resposta inicial (0-15 minutos)

1. Confirmar incidente e severidade.
2. Registrar hora de inicio e sintomas observados.
3. Acionar responsavel tecnico de plantao.
4. Preservar evidencias (logs, prints, mensagens de erro).
5. Comunicar status inicial para equipe operacional.

## 4. Contencao (15-30 minutos)

1. Isolar o componente com falha (frontend, backend ou banco).
2. Ativar procedimento de contingencia local:
   - Controle manual de atendimento (ordem de chegada)
   - Registro temporario em planilha de contingencia
3. Evitar mudancas amplas sem rollback definido.

## 5. Recuperacao do servico

Checklist tecnico:

1. Frontend
- Verificar build e inicializacao do app em `apps/frontend`.
- Confirmar variaveis de ambiente locais e de deploy.

2. Backend
- Verificar API em `apps/backend` e conectividade com Supabase.
- Validar autenticacao e endpoints de fila.

3. Banco/Supabase
- Verificar disponibilidade e migracoes recentes.
- Confirmar integridade minima das tabelas de tickets e services.

4. Realtime/WebSocket
- Validar propagacao de eventos de atualizacao de senha.

## 6. Validacao pos-recuperacao

1. Emitir uma senha de teste.
2. Chamar senha no painel administrativo.
3. Finalizar atendimento de teste.
4. Confirmar consistencia entre painel publico e administrativo.
5. Encerrar contingencia somente apos validacao completa.

## 7. Comunicacao institucional

1. Aviso de incidente aberto (inicio).
2. Aviso de servico restaurado (recuperacao).
3. Aviso de encerramento com causa e acao preventiva.

## 8. Registro para auditoria

Registrar em documento de ocorrencia:

- Data/hora de inicio e fim
- Impacto no atendimento
- Causa raiz (se conhecida)
- Acoes de contencao
- Acoes de recuperacao
- Evidencias tecnicas
- Plano preventivo

## 9. RTO e RPO sugeridos

- RTO alvo: ate 30 minutos para restaurar atendimento basico.
- RPO alvo: sem perda de registros operacionais do dia.

## 10. Acao preventiva obrigatoria apos incidente

1. Criar item de melhoria tecnica com prazo e responsavel.
2. Atualizar este runbook se houve lacuna no procedimento.
3. Reexecutar smoke test funcional em homologacao/producao.
