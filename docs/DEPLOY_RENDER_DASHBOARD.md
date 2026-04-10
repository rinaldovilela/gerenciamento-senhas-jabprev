# 🚀 Deploy Backend no Render - Passo a Passo (Dashboard)

## ✅ Pré-requisitos
- [ ] Conta no Render (https://render.com - crie se não tiver)
- [ ] Código commitado no GitHub
- [ ] Backend pronto em `/backend`

---

## 📋 Passo 1: Preparar Código

### Verificar se `.env.local` está no `.gitignore`
```bash
cat .gitignore | grep ".env"
```

Se não encontrou `.env.local`, adicione:
```bash
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Ensure .env.local is not committed"
git push origin main
```

### Commit final do código
```bash
cd c:\Users\GerênciadeInvestimen\Desktop\gerenciamento-senhas-jabprev

git add .
git commit -m "Add backend with real-time WebSocket and RLS fixes"
git push origin main
```

---

## 🌐 Passo 2: Criar Serviço no Render

1. **Acesse**: https://dashboard.render.com
2. **Login** com GitHub ou email
3. Clique em **"New +"** → **"Web Service"**

---

## 🔗 Passo 3: Conectar Repositório

1. Clique em **"Connect a repository"**
2. Procure por **"gerenciamento-senhas-jabprev"**
3. Selecione e clique **"Connect"**

---

## ⚙️ Passo 4: Configurar Serviço

Preencha os campos:

| Campo | Valor |
|-------|-------|
| **Name** | `jabprev-queue-backend` |
| **Environment** | `Node` |
| **Region** | `São Paulo (sa-east-1)` ← **IMPORTANTE** |
| **Branch** | `main` |
| **Build Command** | `cd backend && npm install && npm run build` |
| **Start Command** | `cd backend && npm start` |
| **Plan** | `Free` |

---

## 🔑 Passo 5: Adicionar Environment Variables

Na aba **"Environment"**, adicione cada uma (clique **"Add Environment Variable"**):

```
PORT
3001

NODE_ENV
production

SUPABASE_URL
https://vrxlaphgwzmtwoweecjp.supabase.co

SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeGxhcGhnd3ptdHdvd2VlY2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDQ0MTcsImV4cCI6MjA5MDAyMDQxN30.Jdd7rjTTsSAzdOR6p1AGzD4qvKF2DOhlA-x6nMZ1yz8

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeGxhcGhnd3ptdHdvd2VlY2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ0NDQxNywiZXhwIjoyMDkwMDIwNDE3fQ.2bWlnntFdnMpe_XcHITiGaIrcNaSCaAvjw8zCWCyG_8

FRONTEND_URL
http://localhost:5173
```

---

## 🚀 Passo 6: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o **build** (2-5 minutos)
3. Veja os logs na aba **"Logs"**

Procure por:
```
🔌 Inicializando WebSocket listeners...
[WebSocket] 🔗 Tickets channel status: SUBSCRIBED
```

---

## ✅ Passo 7: Verificar URL

Seu backend estará em:
```
https://jabprev-queue-backend.onrender.com
```

Teste:
```bash
# PowerShell
Invoke-WebRequest -Uri https://jabprev-queue-backend.onrender.com/health

# Esperado:
# {"status":"ok",...}
```

---

## 📱 Passo 8: Conectar Frontend

Atualize no frontend o `.env.local`:

```
VITE_BACKEND_URL=https://jabprev-queue-backend.onrender.com
```

Build e deploy o frontend (Vercel/Netlify).

---

## 🧪 Testar em Produção

1. Abra seu frontend em produção
2. Abra 2 abas
3. Console (F12): Procure por
   ```
   [SocketClient] ✅ Conectado ao backend
   ```
4. Clique "Iniciar Atendimento" em uma aba
5. Veja a outra aba atualizar instantaneamente ⚡

---

## 🔧 Troubleshooting

### ❌ Build falha
- Verifique os **Logs** no Render Dashboard
- Procure por erro tipo "npm ERR"
- Verifique se `backend/package.json` existe

### ❌ Aplicativo não inicia
- Logs: Dashboard → seu serviço → **"Logs"** tab
- Procure por: `Error:` ou `EADDRINUSE`
- Verifique env vars: todas preenchidas?

### ❌ WebSocket não conecta de produção
- Verifique `FRONTEND_URL` nos env vars
- Atualize frontend `.env` com URL do backend
- Console do frontend (F12): 
  ```
  [SocketClient] ❌ Erro de conexão
  ```

### ❌ Supabase connection refused
- Verifique env vars:
  ```bash
  # No Render Dashboard Logs, procure por:
  ⚠️  Missing SUPABASE_URL
  ```
- Re-check copiar/colar das chaves

---

## 💾 Guardar URLs Importantes

Após deploy bem-sucedido, salve:

```
Backend URL: https://jabprev-queue-backend.onrender.com
Frontend URL: (configuraremos depois)
```

---

## 🎯 Próximos Passos

1. ✅ Deploy backend via este guia
2. ⏭️ Atualizar frontend `.env` com backend URL
3. ⏭️ Deploy frontend (Vercel/Netlify)
4. ⏭️ Testar em produção

---

**Comece pelo Passo 1 acima!** 🚀
