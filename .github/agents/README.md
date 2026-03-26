# 🤖 Guia Completo de Agentes Especializados

Este projeto possui 5 agentes especializados (@Senior, @StaffEngineer, @DBA, @UXEngineer, @SecurityAudit) para cobrir todas as camadas de arquitetura, segurança e design. Cada um é socrático, context-aware e inclui Checklists de Definição de Pronto (DoD).

---

## 📋 Sumário Rápido dos Agentes

| Agente | Especialidade | Use Quando |
|--------|---------------|-----------|
| **@Senior** | Revisão Crítica & Arquitetura | Avaliar design tradeoffs, impacto de mudanças, decisões arquiteturais |
| **@StaffEngineer** | Full-Stack System Design | Garantir completude frontend/backend/database, audit integral do sistema |
| **@DBA** | Database Design & Optimization | Schema design, query performance, indexação, migrations seguras |
| **@UXEngineer** | UX & Frontend Architecture | Design de interfaces, acessibilidade WCAG, performance Web Vitals |
| **@SecurityAudit** | Security & Compliance | OWASP Top 10, threat modeling, penetration testing, compliance |

---

## 🎯 Exemplos Práticos de Invocação

### 1️⃣ @Senior: Análise de Impacto & Arquitetura

#### Exemplo 1: Avaliar Mudança Arquitetural
```
@Senior: Estou pensando em adicionar Redis para cache de sessões. 
Qual o impacto disso no meu sistema? Preciso mudar algo no frontend?
```

**O que esperar:**
- Análise de impacto em cada camada
- Big O notation do cache (O(1) lookup vs. O(n) database query)
- Questões socráticas sobre hit rate, TTL, fallback strategy
- Checklist DoD incluindo: performance targets, testes de cache miss, monitoramento

#### Exemplo 2: Avaliar Duas Abordagens
```
@Senior: Devo usar REST ou GraphQL para minha API? 
Qual é melhor para um sistema de gerenciamento de senhas?
```

**O que esperar:**
- Comparação explícita: REST vs. GraphQL
- Prós/contras para seu caso de uso específico
- Perguntas sobre volume de dados, tipos de clients, team expertise
- Recomendação baseada em constraints

---

### 2️⃣ @StaffEngineer: Full-Stack Completeness

#### Exemplo 1: Audit Integral do Sistema
```
@StaffEngineer: Meu sistema tem 100 usuários agora e pode crescer para 10k.
Revise minha arquitetura—é escalável? O que está faltando?
```

**O que esperar:**
- Assessment de Frontend | Backend | Database | Operations maturity
- Crítico: lista de gaps ordenada por impacto
- Perguntas socráticas sobre consistency requirements, growth trajectory
- Checklist DoD completo cobrindo: Autenticação, Logging, Performance, Testes
- Roadmap faseado (Phase 1: crítico, Phase 2: médio, Phase 3: avançado)

#### Exemplo 2: Planejar Feature Novidade
```
@StaffEngineer: Vou adicionar autenticação com OAuth2 (Google/GitHub).
O que preciso considerar em cada camada?
```

**O que esperar:**
- Frontend: Como armazenar token? Loading states durante login?
- Backend: Como validar token? Rate limiting no endpoint?
- Database: Registrar tentativas de login? OAuth tokens no DB?
- Operations: Como rotacionar client secrets?
- Checklist DoD de segurança (OWASP), testes E2E, monitoramento

---

### 3️⃣ @DBA: Database Design & Optimization

#### Exemplo 1: Design de Schema
```
@DBA: Estou criando tabelas para: usuários, senhas armazenadas, histórico de acesso.
Como devo estruturar o schema? Quais índices preciso?
```

**O que esperar:**
- Análise de normalização (3NF? Denormalizações necessárias?)
- Foreign keys, constraints (NOT NULL, UNIQUE, CHECK)
- Estratégia de índices (primary, composite, partial)
- Perguntas sobre volume (quantos usuários? Quantas senhas por usuário? Retention?)
- Query performance expectations (EXPLAIN PLAN)
- Checklist DoD: Migrations reversíveis, backups testados, Data Security (encryption)

#### Exemplo 2: Query Performance
```
@DBA: Esta query é lenta. Devo adicionar índice, cache ou refatorar a query?
[Compartilhe EXPLAIN output]
```

**O que esperar:**
- Análise do plano de execução
- Recomendação: índice? Reescrever query? Denormalizar?
- Teste de volume (em dados de produção)
- Tradeoff: escrita mais lenta (vs. leitura mais rápida) se adicionar índice
- Monitoring strategy (slow query logs, alertas)

---

### 4️⃣ @UXEngineer: Frontend & UX Architecture

#### Exemplo 1: Design de Form Sensível
```
@UXEngineer: Estou criando um form para o usuário salvar/editar suas senhas.
Como devo estruturar para mobile + desktop? Acessibilidade?
```

**O que esperar:**
- Recomendação: campo por field (email → master password → repetir) vs. form único
- Mobile: tamanho de touch targets (≥44px), viewport setup
- Acessibilidade: labels associadas, tab order lógica, mensagens de erro claras
- Performance: lazy-loading de componentes pesados?
- Perguntas: usuários em conexão lenta? On desktop também?
- Checklist DoD: Lighthouse ≥85, WCAG AA, testes de keyboard navigation

#### Exemplo 2: Performance Optimization
```
@UXEngineer: Meu Lighthouse score caiu de 92 para 78. O que aconteceu?
Como recupero?
```

**O que esperar:**
- Análise de Core Web Vitals (LCP, INP, CLS)
- Culprits prováveis (image not optimized? JavaScript não minificado? Font bloqueante?)
- Recomendações iterativas (high impact first)
- Perguntas: qual é seu target? (85? 90?)
- Monitoring: como vai detectar regressões futuras?

---

### 5️⃣ @SecurityAudit: Security & Compliance

#### Exemplo 1: Audit de Autenticação
```
@SecurityAudit: Meu sistema armazena senhas de usuários no banco + OAuth do Google.
Está seguro? Faça audit OWASP Top 10.
```

**O que esperar:**
- Checklist OWASP completo (A01-A10)
- Críticos: Passwords hashed com bcrypt/Argon2? (não MD5!)
- Perguntas: Rate limiting no login? MFA para admin? Session timeout?
- Gaps: input validation, CSRF tokens, CSP headers, HTTPS enforced?
- Remediation roadmap: Phase 1 (crítico), Phase 2 (médio), Phase 3 (hardening)
- Testing: pentest scenarios (brute-force, credential stuffing, session hijacking?)

#### Exemplo 2: Implementar Segurança numa Feature Nova
```
@SecurityAudit: Vou adicionar um endpoint API `/api/passwords` que retorna 
lista de senhas do usuário. Como faço isso com segurança?
```

**O que esperar:**
- Questões socráticas: Qual é o modelo de autenticação? Todos os usuários confiam entre si?
- A01 (Access Control): Authorization check? Usuário A pode ver senhas de usuário B?
- A03 (Injection): Como filtra by user_id? Parameterized query ou string concat?
- A05 (Security Misconfiguration): Response expõe detalhes internos? Error handling?
- A07 (Auth): Session hijacking protection? CSRF token?
- A09 (Logging): Quem acessou? Quando? Log para auditoria?
- Checklist DoD: Teste de authorization bypass, dependency audit, deployment security

---

## 🚀 Fluxo de Trabalho Recomendado

### Novo Feature
1. **@Senior**: Avaliar design tradeoffs → "REST ou GraphQL?" / "Cache ou DB?"
2. **@StaffEngineer**: Garantir completude → Frontend/Backend/Database alinhados
3. **@DBA**: Schema + queries otimizadas
4. **@UXEngineer**: Interface usável + acessível + performante
5. **@SecurityAudit**: OWASP audit + threat model + testes de penetração

### Before Production Deployment
1. **@StaffEngineer**: Checklist de prontidão
2. **@SecurityAudit**: Security checklist (aplicar todos DoD items)
3. **@DBA**: Backup tested? Rollback plan?
4. **@UXEngineer**: Lighthouse ≥85? Mobile tested?

### Performance Issue
1. **@DBA**: Query performance ou indexing problem?
2. **@UXEngineer**: Frontend bottleneck (bundle, rendering)?
3. **@Senior**: Trade-off analysis (cache vs. query optimization vs. denormalization?)

---

## 🎓 Padrões de Uso

### Pattern 1: Socratic Method (Agent Questions You)
```
You: @StaffEngineer: Is my system production-ready?

StaffEngineer: Before I review, I need context:
1. How many concurrent users do you expect in 6 months?
2. Is high availability required or downtime acceptable?
3. What compliance regulations apply (GDPR, HIPAA, etc.)?
4. Do you have a monitoring/alerting strategy?

[Agent waits for your answers, then provides personalized assessment]
```

### Pattern 2: DoD Checklist Inclusion
```
You: @SecurityAudit: How do I implement authentication securely?

SecurityAudit: 

## Definition of Done Checklist
- [ ] Passwords hashed with bcrypt/Argon2 (NOT MD5/SHA1)
- [ ] Session cookies have HttpOnly, Secure, SameSite flags
- [ ] Rate limiting: max 5 login attempts per 15 minutes
- [ ] MFA option available for sensitive accounts
- [ ] Login attempts logged with timestamp, IP, outcome
- [ ] Inactive session timeout (recommend 30 minutes)
- [ ] Penetration tests: brute-force, credential stuffing, session hijacking
[... continues]
```

### Pattern 3: Context-Aware Recommendations
```
You: @DBA: I have this query. Is it slow?

DBA: [Searches your codebase]
Found your schema in migrations/ and this query in services/SocketClient.ts

Current analysis:
- Table user_passwords has [X] rows (retrieved from migrations)
- No index on user_id (gap detected)
- Query scans full table (O(N))

Recommendation: Add composite index (user_id, created_at DESC)
[includes EXPLAIN output, migration script, validation]
```

---

## 📍 Arquivo Locations

Todos os agentes estão em:
```
.github/agents/
├── senior.agent.md
├── staffengineer.agent.md
├── dba.agent.md
├── uxengineer.agent.md
└── securityaudit.agent.md
```

Compartilhados com seu projeto (via `.github/` commitment).

---

## 🔗 Invocação Rápida

| Comando | O Que Faz |
|---------|----------|
| `@Senior [pergunta sobre design]` | Análise de impacto + tradeoffs |
| `@StaffEngineer [audit do sistema]` | Completeness check + DoD |
| `@DBA [schema/query]` | Design + otimização de DB |
| `@UXEngineer [UI/performance]` | Acessibilidade + Web Vitals |
| `@SecurityAudit [segurança]` | OWASP + threat model + pentest scenarios |

---

## 💡 Dicas Práticas

### Dica 1: Forneça Contexto Específico
**❌ Ruim:**
```
@DBA: Minha query tá lenta.
```

**✅ Bom:**
```
@DBA: Esta query tá lenta. Aqui está o EXPLAIN output:
[EXPLAIN output]
Table user_passwords tem 2M de linhas. Executa 1000x por minuto.
```

### Dica 2: Use Agentes em Sequência para Problems Complexos
```
@Senior: Devo migrar de REST para GraphQL?
→ [Lê recomendação do @Senior]

@StaffEngineer: Se migro para GraphQL, qual é o impacto full-stack?
→ [Lê impacto]

@UXEngineer: E os clientes frontend? Mudança de bundle size?
→ [Lê impacto no frontend]
```

### Dica 3: Aproveite Checklists DoD para Deploy
```
@SecurityAudit: Estou pronto para produção? Revise segurança.
→ [Copie o checklist]
→ [Crie task list no seu project management]
→ [Marque items conforme completa]
```

---

## ✅ Checklist Rápido: "Meu Projeto Tem o Mínimo de Segurança?"

Use **@SecurityAudit** com este prompt:
```
@SecurityAudit: Revise meu sistema contra OWASP Top 10.
Qual é o score mínimo aceitável?
```

Esperado: Scores altos em A01-A05 (Access Control, Crypto, Injection, Auth, Config).

---

## 🚨 Escalation Path

| Cenário | Agente | Ação |
|---------|--------|------|
| "Não sei por onde começar" | @StaffEngineer | Full system audit |
| "Performance degradando" | @DBA + @UXEngineer | Comparar BD vs Frontend bottleneck |
| "Achei vulnerability" | @SecurityAudit | Audit + remediation roadmap |
| "Feature precisa design" | @UXEngineer → @Senior | UX design → architecture review |
| "Escalabilidade?" | @Senior + @StaffEngineer | Strategy → implementation plan |

---

**🎉 Pronto para começar! Use os agentes para elevar a qualidade e segurança do seu projeto.**
