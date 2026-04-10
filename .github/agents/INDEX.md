# 📖 Índice Completo: Agentes Especializados

Bem-vindo ao seu time de especialistas automáticos! Este diretório contém **5 agentes especializados** + **guias e referências** para cobrir todas as camadas do seu projeto com rigor, segurança e qualidade.

---

## 🤖 OS 5 AGENTES

### 1. **@Senior** – Revisão Crítica & Arquitetura
**Arquivo:** [senior.agent.md](senior.agent.md)

Especialista em análise de impacto, tradeoffs arquiteturais e Big-O complexity.

**Use quando:**
- Precisa avaliar decisões arquiteturais (REST vs GraphQL, SQL vs NoSQL)
- Quer Big O analysis e scaling assessment
- Tem múltiplas abordagens e precisa de comparação com prós/contras

**Exemplo rápido:**
```
@Senior: Devo usar Redis caching ou melhorar minha query?
Contexto: 10k requisições/min, p95 latency = 150ms (target: 50ms)
```

---

### 2. **@StaffEngineer** – Full-Stack System Design
**Arquivo:** [staffengineer.agent.md](staffengineer.agent.md)

Responsável pela completude integral: Frontend + Backend + Database + Operations.

**Use quando:**
- Antes de lançar em produção (completeness check)
- Nova feature afeta múltiplas camadas
- Precisa validar DoD checklist (segurança, performance, testes)

**Exemplo rápido:**
```
@StaffEngineer: Meu MVP tem 50 users, quer escalar para 1000. Está pronto?
```

---

### 3. **@DBA** – Database Design & Optimization
**Arquivo:** [dba.agent.md](dba.agent.md)

Especialista em schema design, query optimization, indexação e migrations seguras.

**Use quando:**
- Query tá lenta (compartilhe EXPLAIN output)
- Precisa design de novo schema
- Quer planejar migration sem downtime

**Exemplo rápido:**
```
@DBA: Minha query SELECT * FROM passwords... tá lenta.
[EXPLAIN output aqui]
Devo index? Refatorar? Denormalizar?
```

---

### 4. **@UXEngineer** – Frontend & User Experience
**Arquivo:** [uxengineer.agent.md](uxengineer.agent.md)

Especialista em performance (Web Vitals), acessibilidade (WCAG 2.1 AA) e component architecture.

**Use quando:**
- Lighthouse score baixo ou caiu
- Precisa revisar acessibilidade
- Design de component library ou patterns

**Exemplo rápido:**
```
@UXEngineer: Meu Lighthouse caiu de 90 para 78. Ajuda?
```

---

### 5. **@SecurityAudit** – Security & Compliance
**Arquivo:** [securityaudit.agent.md](securityaudit.agent.md)

Especialista em OWASP Top 10, threat modeling, penetration testing e compliance (GDPR, CCPA, HIPAA).

**Use quando:**
- Precisa audit OWASP Top 10
- Encontrou vulnerability potencial
- Quer penetration test scenarios
- Compliance requirements (GDPR, HIPAA, CCPA, etc.)

**Exemplo rápido:**
```
@SecurityAudit: Revise meu password manager contra OWASP.
Arquitetura: React + Node + Supabase. Threat model: insider attack.
```

---

## 📚 GUIAS E REFERÊNCIAS

### **README.md** – Guia Completo
**Arquivo:** [README.md](README.md)

Overview dos 5 agentes, padrões de uso, checklist rápido, exemplos. **Comece aqui se é novo.**

**Seções:**
- Sumário dos agentes
- Exemplos práticos completos por agente
- Fluxo de trabalho recomendado
- Padrões de uso (Socratic, DoD checklists, context-aware)

---

### **QUICK_REFERENCE.md** – Cheat Sheet de Invocação
**Arquivo:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

Prompts prontos para copiar/colar + tabela de decisão. **Use quando sabe o que quer mas esqueceu o prompt exato.**

**Seções:**
- Prompts template para cada agente
- Exemplos reais com contexto
- Tabela de decisão (qual agente chamar?)
- Dicas ouro para usar os agentes efetivamente

---

### **FULL_AUDIT_EXAMPLE.md** – Cenário End-to-End
**Arquivo:** [FULL_AUDIT_EXAMPLE.md](FULL_AUDIT_EXAMPLE.md)

Exemplo prático completo: Antes de lançar em produção, como usar TODOS os 5 agentes em sequência?

**Cenário:** Password manager com 50 beta users, escalando para 1000+.

**Fases:**
1. Phase 1: @StaffEngineer – Full-stack audit
2. Phase 2: @SecurityAudit – Deep-dive security
3. Phase 3: @DBA – Database optimization
4. Phase 4: @UXEngineer – Frontend performance
5. Phase 5: @Senior – Architecture decisions

**Saída:** Full production readiness checklist + DoD items + Launch day checklist

---

## 🎯 Quick Start (3 Minutos)

### Se você quer saber o que cada agente faz:
→ Leia [README.md](README.md) (seção "Sumário Rápido")

### Se você sabe o que quer fazer mas não sabe o prompt:
→ Use [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### Se você quer um exemplo realista completo:
→ Leia [FULL_AUDIT_EXAMPLE.md](FULL_AUDIT_EXAMPLE.md)

### Se você quer detalhes técnicos de um agente específico:
→ Veja arquivo individual (senior.agent.md, dba.agent.md, etc.)

---

## 📋 Matrix de Decisão: Qual Agente?

| Pergunta | Agente | Referência |
|----------|--------|-----------|
| Qual tecnologia usar? (REST vs GraphQL, SQL vs NoSQL) | @Senior | [README.md](README.md#1-senior) |
| Está escalável? | @StaffEngineer | [README.md](README.md#2-staffengineer) |
| Query tá lenta? | @DBA | [QUICK_REFERENCE.md](QUICK_REFERENCE.md#1-query-performance-problem) |
| Lighthouse score baixo? | @UXEngineer | [QUICK_REFERENCE.md](QUICK_REFERENCE.md#1-performance-optimization) |
| Tá seguro? (OWASP audit) | @SecurityAudit | [QUICK_REFERENCE.md](QUICK_REFERENCE.md#1-owasp-top-10-audit) |
| Pronto pra produção? | @StaffEngineer + @SecurityAudit | [FULL_AUDIT_EXAMPLE.md](FULL_AUDIT_EXAMPLE.md) |
| Performance bad? | @UXEngineer OU @DBA | [README.md](README.md#fluxodetrabalhorecomendado) |
| Nova feature? | @StaffEngineer | [QUICK_REFERENCE.md](QUICK_REFERENCE.md#2-planejar-nova-feature) |

---

## 🚀 Fluxo Recomendado por Estágio

### 📌 MVP Phase (Development)
```
@UXEngineer: "Design está usável e rápido?"
→ @DBA: "Schema está escalável?"
→ @Senior: "Arquitetura faz sentido?"
```

### 🚀 Pre-Launch Phase (1 semana antes)
```
@StaffEngineer: Full system audit
→ @SecurityAudit: OWASP deep-dive
→ @DBA: Database readiness
→ @UXEngineer: Lighthouse + accessibility
→ @Senior: Final architecture sign-off
```

### 📊 Production Phase (Post-Launch Monitoring)
```
@SecurityAudit: "Vulnerabilidades novas?" (weekly)
@DBA: "Database performance stable?" (daily)
@StaffEngineer: "System health ok?" (weekly)
@UXEngineer: "User experience metrics?" (daily)
```

---

## 🎓 Casos de Uso por Agente

### @Senior
- ✅ "Devemos usar microserviços ou monolito?"
- ✅ "Qual é o Big-O dessa mudança?"
- ✅ "Performance vs legibilidade—qual é melhor?"
- ✅ "Impact analysis da mudança de DB"

### @StaffEngineer
- ✅ "Meu MVP está production-ready?"
- ✅ "Nova feature: como afeta frontend/backend/database?"
- ✅ "Checklist de prontidão antes de launch?"
- ✅ "Escalabilidade até 10k usuários?"

### @DBA
- ✅ "Query tá lenta—EXPLAIN output: [...]"
- ✅ "Como estruturar schema para [requisito]?"
- ✅ "Migration plan sem downtime?"
- ✅ "Índices: quanto preciso?"

### @UXEngineer
- ✅ "Lighthouse 78 (target: 85), ajuda?"
- ✅ "Acessibilidade WCAG AA—revise?"
- ✅ "Component library está escalável?"
- ✅ "Mobile performance assessment?"

### @SecurityAudit
- ✅ "OWASP Top 10 audit—vulnerabilities?"
- ✅ "Authentication system—secure?"
- ✅ "Penetration test scenario: user A access user B data?"
- ✅ "GDPR compliance checklist?"

---

## 🔒 Propriedades Garantidas

Todos os agentes garantem:

✅ **Socratic**: Questionam antes de assumir, exploram trade-offs  
✅ **Context Aware**: Buscam padrões e gaps no seu workspace  
✅ **DoD Checklists**: Retornam checklist de prontidão para cada decisão  
✅ **OWASP Aware**: Segurança é uma preocupação principal, sempre mencionada  
✅ **Performance Conscious**: Big-O, scalability, tradeoffs considerados  
✅ **Testability First**: Sempre incluem estratégia de testes  

---

## 📁 Estrutura de Arquivos

```
.github/agents/
├── README.md                    ← Start here (overview completo)
├── QUICK_REFERENCE.md           ← Snippets prontos para usar
├── FULL_AUDIT_EXAMPLE.md        ← Cenário real completo (5 agentes em sequência)
├── INDEX.md                     ← Este arquivo (navegação)
├── senior.agent.md              ← Individual agent file
├── staffengineer.agent.md       ← Individual agent file
├── dba.agent.md                 ← Individual agent file
├── uxengineer.agent.md          ← Individual agent file
└── securityaudit.agent.md       ← Individual agent file
```

---

## 💡 Tips & Tricks

### 1. Use em Sequência, Não em Paralelo
Cada agente aproveita contexto do anterior:

```
@StaffEngineer: [audit inicial]
→ @SecurityAudit: [com contexto de gaps]
→ @DBA: [com compreensão de problemas críticos]
```

### 2. Forneça EXPLAIN Output
Para @DBA com performance issues:

```
@DBA: Essa query tá lenta.
[Inclua EXPLAIN (ANALYZE) output aqui]
```

### 3. Use DoD Checklists Como Sprint Tasks
Copia o checklist que cada agente retorna para seu jira/github/todoist.

### 4. Customize os Prompts
Templates são começos. Adapte para seu contexto específico (tecnologias, números reais, constraints).

---

## 🎯 Mais Recursos

- **Todos usam contexto do seu workspace**: Agentes buscam padrões, gaps, dependências em seus arquivos
- **Integração com CI/CD**: Recomendações incluem como automatizar (security scans, Lighthouse CI, load tests)
- **Compliance: GDPR, HIPAA, CCPA**: @SecurityAudit cobre regulações

---

## 🚀 Get Started Now!

**Option A (5 min): Quick Overview**
```
Leia: README.md (seção "Sumário Rápido")
```

**Option B (15 min): Learn by Example**
```
Leia: FULL_AUDIT_EXAMPLE.md
→ Simule seu projeto no cenário
```

**Option C (30 min): Deep Dive**
```
1. README.md (overview)
2. QUICK_REFERENCE.md (snippets)
3. Arquivo específico do agente que te interessa
```

---

**🎉 Você tem um time de 5 especialistas 24/7. Bora usar!**

---

## 🤝 Support

- Se um agente não entendeu: Forneça mais contexto
- Se precisa de comparação A vs B: Use @Senior
- Se precisa de roadmap: Use @StaffEngineer
- Se tem vulnerability: Use @SecurityAudit imediatamente

**Questions? Revise os exemplos em FULL_AUDIT_EXAMPLE.md **
