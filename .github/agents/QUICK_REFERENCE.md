# ⚡ Quick Reference: Agentes Especializados

Copie e cole os prompts abaixo diretamente no chat com `@AgentName`.

---

## 🔵 @Senior – Revisão Crítica & Arquitetura

### #1: Devo usar tecnologia X ou Y?
```
@Senior: Devo usar [Opção A] ou [Opção B]?
Contexto: [Descreva o problema]
Constraints: [Budget/tempo/team expertise]
```

**Exemplo Real:**
```
@Senior: Devo implementar caching com Redis ou HTTP caching (ETags)?
Contexto: Meu API retorna lista de 100+ senhas, muitos usuários consultam simultaneamente.
Constraints: Equipe pequena (1 dev backend), budget baixo.
```

---

### #2: Avaliar Mudança Arquitetural
```
@Senior: Estou pensando em [mudar arquitetura/adicionar técnica/refatorar].
Impacto esperado: [O que espera ganhar]
Trade-offs que preocupam: [O que pode piorar?]
Restrições: [Tempo/budget/team]

Análise: Qual é o risco? Vale a pena?
```

**Exemplo Real:**
```
@Senior: Quero migrar de REST para GraphQL.
Impacto esperado: Reduzir over-fetching no mobile, melhorar DX frontend.
Trade-offs: Complexidade backend sobe, preciso novo API design.
Restrições: 2 semanas para implementar, time é junior em GraphQL.

Vale a pena agora?
```

---

### #3: Big O Analysis & Scaling
```
@Senior: Meu sistema está ficando lento com [número de usuários/dados].
Padrão: [Descreva o fluxo de dados]
Current approach: [Como funciona hoje]
Scaling target: [Quanto deve suportar?]

Ajuda a identificar o gargalo?
```

---

## 🟠 @StaffEngineer – Full-Stack System Design

### #1: Audit Integral Antes de Launch
```
@StaffEngineer: Estou pronto para produção? Revise meu sistema.

Stack:
- Frontend: [Framework/libs]
- Backend: [Language/framework/deployment]
- Database: [Type/service]
- Current users: [Número]
- Expected growth: [Trajectory]

DoD checklist: O que estou perdendo?
```

**Exemplo Real:**
```
@StaffEngineer: Estou pronto para produção? MVP tem 50 beta users.

Stack:
- Frontend: React + Vite (bundle 150KB)
- Backend: Node/Express no Render.com
- Database: Supabase PostgreSQL
- Current users: 50 beta
- Target: 1000+ users em 6 meses

O que falta para escalar?
```

---

### #2: Planejar Nova Feature
```
@StaffEngineer: Preciso adicionar [feature] ao sistema.

Feature: [Descrição]
Requirements: [O que deve fazer]
Non-functional: [Performance/scale/reliability needs]

Design completo: como afeta frontend/backend/database?
```

**Exemplo Real:**
```
@StaffEngineer: Preciso adicionar autenticação OAuth (Google + GitHub).

Requirements: Users podem login com Google ou GitHub
Non-functional: Suportar 10k+ Google SSO requests/dia, zero failed logins
Compliance: GDPR (coleto email + nome)

Como afeta: frontend, backend, database, deploy?
```

---

### #3: Disaster Recovery Planning
```
@StaffEngineer: Preciso planejar disaster recovery.

Current: [Descreva infraestrutura]
Data sensitivity: [PII? Financial? Health?]
RTO/RPO targets: [Recovery Time/Point Objective]

Plano completo: como recupero de cenários críticos?
```

---

## 🔴 @DBA – Database Design & Optimization

### #1: Query Performance Problem
```
@DBA: Essa query está lenta.

[Copie o SQL]

[Copie EXPLAIN output se tiver]

Volume de dados: [N linhas]
Query frequency: [X queries/sec]
Target latency: [P95 < ?ms]

Está faltando índice? Devo refatorar query ou denormalizar?
```

**Exemplo Real:**
```
@DBA: Meu grid de senhas (50k linhas) tá lento.

SQL:
SELECT * FROM passwords 
WHERE user_id = $1 
ORDER BY updated_at DESC 
LIMIT 50;

EXPLAIN (ANALYZE):
Seq Scan on passwords  (cost=0.00..1500.00 rows=5000)
  Filter: (user_id = 1)

Volume: 50k+ linhas na tabela
Query freq: 100 queries/sec (50 users, 2 qry/sec cada)
Target: P95 < 50ms

Tá faltando índice?
```

---

### #2: Schema Design
```
@DBA: Como devo estruturar meu schema?

Entities: [Lista de dados]
Relationships: [Como se relacionam]
Queries: [Principais queries]
Volume: [Estimativa de dados]

É 3NF? Precisa denormalizar? Cascade delete risky?
```

**Exemplo Real:**
```
@DBA: Schema para password manager.

Entities:
- users: (id, email, password_hash)
- passwords: (id, user_id, service_name, password, notes)
- audit_logs: (id, user_id, action, timestamp)

Queries principais:
1. List user's passwords ordenado por updated_at
2. Search passwords by service_name
3. Audit log report

Volume: 1000 users, 50 senhas/user, 2 anos de audit logs

Schema ok? Constraints? Índices?
```

---

### #3: Migration Strategy
```
@DBA: Preciso fazer essa mudança no schema (sem downtime).

Current schema: [Descreva]
Desired schema: [Descreva]
Constraints: [Downtime aceitável? 0? 1h?]

Migration plan: Passos + rollback strategy?
```

---

## 🟢 @UXEngineer – Frontend & UX

### #1: Performance Optimization
```
@UXEngineer: Meu app tá lento. Ajuda?

Framework: [React/Vue/Svelte/...]
Bundle size: [?KB]
Current Lighthouse: [Score]
Problem: [O que tá lento? Desktop? Mobile?]

Diagnóstico: O que falta?
```

**Exemplo Real:**
```
@UXEngineer: Meu React app tá lento no mobile.

Framework: React + Vite
Bundle: 180KB
Current Lighthouse: 78
Problem: Mobile 3G feels sluggish, modal pops in com jank

O que é culpa do código? Do bundle? Da API?
```

---

### #2: Accessibility Audit
```
@UXEngineer: Revise acessibilidade da minha interface.

Framework: [React/Vue/...]
Features: [Listar principais UIs]
Target: WCAG 2.1 AA

Gaps de acessibilidade? Keyboard nav? Screen reader?
```

**Exemplo Real:**
```
@UXEngineer: Revise acessibilidade da minha interface.

Framework: React
Features: Login form, password list table, add password modal
Target: WCAG 2.1 AA compliance

Está pronta para usuários cegos/motor impairment?
```

---

### #3: Design System Review
```
@UXEngineer: Meu component library está bom?

Components: [Listar]
Design system: [Tailwind? Styled-components? Custom?]
Issues: [O que preocupa?]

São reutilizáveis? Testáveis? Escaláveis?
```

---

## 🔒 @SecurityAudit – Security & Compliance

### #1: OWASP Top 10 Audit
```
@SecurityAudit: Revise meu sistema contra OWASP Top 10.

Architecture: [Frontend/Backend/DB stack]
Current auth: [Como autentica?]
Sensitive data: [O que protege?]
Threat model: [Quem é o atacante?]

Audit completo: Qual a vulnerabilidade mais crítica?
```

**Exemplo Real:**
```
@SecurityAudit: Revise meu password manager contra OWASP.

Architecture: React frontend + Node/Express backend + Supabase PostgreSQL
Auth: JWT-based, token na localStorage
Sensitive data: User passwords (criptografadas no DB)
Threat model: Insider attack, credential stuffing, XSS em frontend

Tá seguro? Quanto falta para produção?
```

---

### #2: Penetration Test Scenarios
```
@SecurityAudit: Simule ataque contra meu sistema.

Endpoint: [Qual você quer testar?]
Method: [POST/GET/PUT/...?]
Payload: [O que você enviaria?]

Como quebro isso? Qual é o cenário de penetration test?
```

**Exemplo Real:**
```
@SecurityAudit: Simule ataque na minha API.

Endpoint: GET /api/passwords/:id
Current: Retorna senha se usuário autenticado

Teste: User A tenta acessar /api/passwords/user-b-id
Resultado esperado: 403 Forbidden
Resultado real: [Qual você acha que seria?]

Tem authorization bypass?
```

---

### #3: Compliance Checklist
```
@SecurityAudit: Estou pronto para compliance?

Data coletado: [Email? Phone? SSN?]
Regulações aplicáveis: [GDPR? HIPAA? CCPA?]
Current practices: [Tem privacy policy? Data retention policy?]

Compliance roadmap para produção?
```

---

## 🎯 Prompts de "Tudo Junto" (Use em Sequência)

### Scenario: "Quero Lançar em Produção"
```
1️⃣ @StaffEngineer: Meu MVP está pronto para produção? Revise completude.

2️⃣ @SecurityAudit: [Após revisar StaffEngineer] Revise segurança contra OWASP.

3️⃣ @DBA: [Após segurança] Database é escalável? Índices ok?

4️⃣ @UXEngineer: [Após DB] Frontend performance ok? Acessibilidade?

5️⃣ @Senior: [Após todos] Trade-offs estratégicos? Falta algo crítico?
```

---

### Scenario: "Performance Degradando"
```
1️⃣ @UXEngineer: Frontend é culpado? Lighthouse score, bundle size?

2️⃣ @DBA: [Se não for frontend] Database é culpado? Queries lentas?

3️⃣ @Senior: [Após diag] Big-O analysis? Root cause real?
```

---

### Scenario: "Achei Vulnerability"
```
1️⃣ @SecurityAudit: Revise essa vulnerabilidade. Qual o severity? Fix?

2️⃣ @StaffEngineer: [Após fix]É necessário redesign de componentes?

3️⃣ @Senior: [Se arquitetura afetada] Impacto full-stack?
```

---

## 📊 Tabela de Decisão: Qual Agente Chamar?

| Pergunta | Agente |
|----------|--------|
| "Qual tecnologia usar?" | @Senior |
| "É escalável?" | @StaffEngineer |
| "Query tá lenta?" | @DBA |
| "Lighthouse score baixo?" | @UXEngineer |
| "Tá seguro?" | @SecurityAudit |
| "Pronto pra produção?" | @StaffEngineer (completa) + @SecurityAudit (segurança) |
| "Performance bad?" | @UXEngineer OU @DBA (diagnostic) |
| "Devo mudar de arquitetura?" | @Senior (decision) → @StaffEngineer (planning) |
| "Nova feature, como faz?" | @StaffEngineer (design completo) |

---

## 💡 Dicas Ouro

### Dica 1: Context Completo = Resposta Melhor
**❌ Ruim:**
```
@DBA: Query tá lenta.
```

**✅ Bom:**
```
@DBA: Essa query retorna 50k linhas, executada 100x/sec em produção.
EXPLAIN: [output aqui]
Target latency: P95 < 100ms
Devo adicionar índice ou refatorar query?
```

---

### Dica 2: Use Agentes em Sequência, Não em Paralelo
Varia a entrada de cada agente baseado na saída do anterior:

```
@StaffEngineer: Está completo?
  → [Identifica gaps]

@SecurityAudit: [Com contexto do StaffEngineer] Segurança ok?
  → [Identifica vulnerabilidades]

@DBA: [Com contexto anterior] Database é culpado?
  → [Identifica gargalos]

@Senior: [Com tudo anterior] Trade-offs? Root cause?
  → [Recomendação final]
```

---

### Dica 3: Use os Checklists DoD Como Task List
Cada agente retorna DoD checklist. Copie para seu project management:

```
☐ Passwords hashed com bcrypt (A02 OWASP)
☐ Rate limiting implemented (A05 OWASP)
☐ JWT em HttpOnly cookie (não localStorage)
☐ Indexes created + validated
☐ Lighthouse ≥85
☐ WCAG AA passed
```

---

### Dica 4: Customize os Prompts
Os exemplos acima são templates. Adapte para seu contexto:

Replace:
- `[password manager]` → seu projeto
- `[Node/Express]` → sua stack
- `[50 beta users]` → seu scale

---

## 🚀 Ready?

**Today's Plan:**
```
Morning: 
  @StaffEngineer: Full audit
  @SecurityAudit: Security deep-dive

Afternoon:
  @DBA: Database review
  @UXEngineer: Performance optimization

Evening:
  @Senior: Architecture decisions
  → Compile DoD checklists
  → Create sprint backlog
  
Resultado: Production-ready roadmap ✅
```

---

**🎉 Você tem tudo que precisa. Bora codar!**
