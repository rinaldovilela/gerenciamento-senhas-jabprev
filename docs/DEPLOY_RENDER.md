# 🚀 Deploy Backend no Render (Guia Completo)

## Opção 1: Deploy via GitHub (Recomendado - Mais Fácil)

### Passo 1: Push do código para GitHub
```bash
cd c:\Users\GerênciadeInvestimen\Desktop\gerenciamento-senhas-jabprev
git add .
git commit -m "Add backend with real-time WebSocket and RLS fixes"
git push origin main
```

### Passo 2: Conectar no Render Dashboard
1. Acesse https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Selecione **"Connect a repository"**
4. Procure e selecione seu repo (gerenciamento-senhas-jabprev)
5. Configure:

```
Name:               jabprev-queue-backend
Runtime:            Node
Build Command:      cd backend && npm install && npm run build
Start Command:      cd backend && npm start
Branch:             main
```

### Passo 3: Environment Variables
Na aba **"Environment"**, adicione:

```
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://vrxlaphgwzmtwoweecjp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeGxhcGhnd3ptdHdvd2VlY2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDQ0MTcsImV4cCI6MjA5MDAyMDQxN30.Jdd7rjTTsSAzdOR6p1AGzD4qvKF2DOhlA-x6nMZ1yz8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeGxhcGhnd3ptdHdvd2VlY2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ0NDQxNywiZXhwIjoyMDkwMDIwNDE3fQ.2bWlnntFdnMpe_XcHITiGaIrcNaSCaAvjw8zCWCyG_8
FRONTEND_URL=https://seu-frontend.vercel.app
```

### Passo 4: Deploy
Clique em **"Create Web Service"** e aguarde (2-5 min)

Resultado: 
- URL como: `https://jabprev-queue-backend.onrender.com`
- Auto-redeploy quando fizer push no GitHub

---

## Opção 2: Deploy via Dashboard Web (Sem Git)

Se preferir não usar GitHub:

1. https://dashboard.render.com → **"New +"** → **"Web Service"**
2. Cole URL do Git repo manual ou ZIP upload
3. Configure conforme Opção 1
4. Deploy!

---

## Opção 3: Deploy via Render API (Avançado)

Se quiser automatizar via API:

```bash
# Instalar render CLI (se disponível na sua região)
npm install -g @render/cli

# Login
render login

# Ver projetos
render projects list

# Deploy
render deploy
```

**Nota:** O Render CLI nem sempre está disponível em todas regiões.

---

## ✅ Verificações Pós-Deploy

### 1. Health Check
```bash
curl https://jabprev-queue-backend.onrender.com/health
# Esperado: {"status":"ok",...}
```

### 2. Acessar Logs
No Render Dashboard → seu web service → **"Logs"**

Procure por:
```
🔌 Inicializando WebSocket listeners...
[WebSocket] 🔗 Tickets channel status: SUBSCRIBED
```

### 3. Testar WebSocket (via Frontend)
Atualize `.env` do frontend:
```bash
VITE_BACKEND_URL=https://jabprev-queue-backend.onrender.com
```

Build e acesse frontend → Console deve mostrar:
```
[SocketClient] ✅ Conectado ao backend
```

---

## 🔧 Troubleshooting

### ❌ Build falha
- Verifique se `backend/package.json` existe
- Verifique se `backend/src/server.ts` existe
- Logs: Dashboard → "Logs" tab

### ❌ WebSocket não conecta em produção
- CORS: Verifique `FRONTEND_URL` nos env vars
- Port: Render expõe automaticamente, não precisa configurar
- Teste: `curl https://seu-backend.onrender.com/health`

### ❌ Supabase connection fails
- Verifique se env vars estão corretos
- Test: Dashboard → "Shell" console
```bash
curl https://seu-backend.onrender.com/api/status
```

---

## 📊 Próximas Etapas

1. **Deploy backend agora** (Opção 1 acima)
2. **Atualizar frontend** com nova URL backend
3. **Deploy frontend** (Vercel/Netlify)
4. **Testar produção**: Abrir 2 abas → Clique Iniciar Atendimento → Ver sincronizar em tempo real

---

## 💰 Custos

- **Render Free Tier:**
  - 750 horas/mês (suficiente)
  - Spin down após 15 min inativo
  - CPU compartilhada
  
- **Para mais performance:**
  - Upgrade para Starter ($7/mês)
  - Sem spin down
  - Mais CPU

---

## 🔐 Segurança

⚠️ **Importante:**
- Não comite `.env.local` (está no `.gitignore`?)
- Env vars sensíveis apenas no Render Dashboard
- Para produção, usar Supabase Auth JWT (não mock)
- CORS: Sempre configurar FRONTEND_URL específica

---

**Próximo:** Siga os passos da Opção 1 acima! 🚀
