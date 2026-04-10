# 🚀 GUIA DE DEPLOYMENT - MVP Jabprev Queue

**Última atualização:** 26 de Março de 2025
**Versão:** 1.0

---

## ⚡ DEPLOYMENT CHECKLIST

### Fase 1: Staging Database

```bash
# 1. Push migrations ao Supabase
cd project-root
supabase db push

# 2. Verificar tabelas criadas
supabase db list-tables

# 3. Verificar tipo de dados
supabase db list-columns public.tickets
supabase db list-columns public.users
supabase db list-columns public.attendance_records
```

### Fase 2: Backend Configuração

```bash
# 1. Copiar .env-example para .env se não existir
cd backend
cp .env.example .env  # Se necessário

# 2. Configurar JWT_SECRET forte (mínimo 32 caracteres)
# Editar backend/.env:
JWT_SECRET=seu-super-secret-jwt-key-minimo-32-chars

# 3. Instalar dependências
npm install

# 4. Testar conexão
npm start
# Esperado: "Server running on port 3001"
```

### Fase 3: Frontend Configuração

```bash
# 1. Verificar .env.local está limpo
cat .env.local | grep -i appwrite && echo "❌ ALERTA: Appwrite encontrado!" || echo "✅ OK"

# 2. Instalar dependências
npm install

# 3. Testar ambiente
npm run dev
# Esperado: "VITE v5.x ready in Xxms"
```

### Fase 4: Teste End-to-End

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
npm run dev

# Terminal 3: Testes Manuais
# 1. Abrir http://localhost:5173
# 2. Selecionar tipo de usuário
# 3. Selecionar serviço
# 4. Verificar senha criada
# 5. Abrir http://localhost:5173/restricted (Painel de Operador)
# 6. Chamar próxima senha
# 7. Verificar WebSocket real-time
```

---

## 📋 DEPLOYMENT PRODUÇÃO

### Backend (Render.com ou similar)

```yaml
# render.yaml
services:
  - type: web
    name: jabprev-backend
    env: node
    plan: standard
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        value: YOUR_STRONG_SECRET_FROM_ENV_VAR
      - key: SUPABASE_URL
        value: https://vrxlaphgwzmtwoweecjp.supabase.co
      - key: SUPABASE_SERVICE_ROLE_KEY
        value: YOUR_SERVICE_ROLE_KEY
      - key: CORS_ORIGIN
        value: https://seu-dominio.com
```

### Frontend (Vercel ou Netlify)

```bash
# Vercel: vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_SUPABASE_URL": "https://vrxlaphgwzmtwoweecjp.supabase.co",
    "VITE_SUPABASE_ANON_KEY": "seu-anon-key",
    "VITE_BACKEND_URL": "https://jabprev-backend.render.com"
  }
}
```

---

## 🔍 VALIDAÇÃO PÓS-DEPLOYMENT

### 1. Health Check Backend
```bash
curl http://localhost:3001/health
# Esperado: { status: "ok" }
```

### 2. Verificar Supabase Conectado
```bash
curl http://localhost:3001/api/v1/services
# Esperado: Array de serviços
```

### 3. Teste de Autenticação
```bash
POST /api/v1/auth/login
Body: { email: "admin@jabprev.gov.br", password: "..." }
# Esperado: { token: "jwt-token..." }
```

### 4. Teste Real-time WebSocket
```javascript
// No console do navegador
const channel = supabase.channel('public:tickets');
channel.subscribe((message) => console.log(message));
// Esperado: Conectar e receber updates
```

---

## ⚠️ TROUBLESHOOTING

### Erro: "JWT_SECRET not provided"
```
❌ Backend não achou .env
✅ Solução: Verificar se backend/.env existe e tem JWT_SECRET
```

### Erro: "Cannot find SUPABASE_URL"
```
❌ Variáveis de ambiente não carregadas
✅ Solução: 
  - Verificar backend/.env
  - Fazer npm install novamente
  - Reiniciar processo
```

### Erro: "WebSocket connection failed"
```
❌ CORS ou ambiente errado
✅ Solução:
  - Verificar CORS_ORIGIN em backend/.env
  - Verificar VITE_BACKEND_URL em frontend .env.local
  - Certificar que backend está rodando
```

### Erro: "Appwrite references in code"
```
❌ Ainda há código Appwrite
✅ Solução:
  - grep -r "APPWRITE" src/
  - grep -r "appwrite" src/
  - Remover imports e referências
```

---

## 📈 MONITORAMENTO PÓS-LAUNCH

### Métricas Importantes
- [ ] Tempo de resposta API (< 200ms)
- [ ] Taxa de erro (< 0.1%)
- [ ] Conexões WebSocket ativas
- [ ] Tickets criados por hora
- [ ] CPU/Memória Backend

### Logs para Monitorar
```bash
# Backend logs
tail -f logs/backend.log | grep ERROR

# Supabase logs
supabase logs pull

# Frontend errors
Browser DevTools > Console
```

---

## 🔐 PRODUÇÃO - SECURANÇA

### Antes de ir ao ar:

- [ ] JWT_SECRET é único e forte (32+ chars)
- [ ] Sem referências a Appwrite no código
- [ ] CORS_ORIGIN configurado corretamente
- [ ] HTTPS/SSL ativado
- [ ] Rate limiting configurado
- [ ] Backup diário do banco ativado
- [ ] Logs centralizados

---

## 📞 SUPORTE

Se encontrar problemas:

1. Verificar [2026-03-26_MVP_STATUS_FINAL.md](../audits/2026-03-26_MVP_STATUS_FINAL.md)
2. Consultar [2026-03-26_GAPS_CORRIGIDOS.md](../audits/2026-03-26_GAPS_CORRIGIDOS.md)
3. Revisar [BACKEND_README.md](../BACKEND_README.md)
4. Abrir issue no repositório

---

**Deployment: Simples, Seguro, Pronto! 🎉**
