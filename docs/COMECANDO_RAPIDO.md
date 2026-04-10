# 🚀 Guia Rápido - Backend + Frontend

## ✅ O que foi criado

- ✅ Servidor Node.js com Socket.IO em `/backend`
- ✅ Listeners de real-time do Supabase
- ✅ WebSocket para comunicação frontend ↔ backend
- ✅ Frontend atualizado para usar WebSocket
- ✅ Migrations para garantir real-time funcione

## 🎯 Começar Agora (3 passos)

### Passo 1: Backend em Desenvolvimento

```bash
# Terminal 1 - Backend
cd backend
npm run dev
```

Esperado:
```
╔════════════════════════════════════════════╗
║   🚀 JABPREV Queue Backend Iniciado       ║
╠════════════════════════════════════════════╣
║ 📡 WebSocket: ws://localhost:3001
║ 🔗 HTTP: http://localhost:3001
╚════════════════════════════════════════════╝
```

### Passo 2: Frontend em Desenvolvimento

```bash
# Terminal 2 - Frontend
npm run dev
```

Esperado:
```
VITE v6.4.1  ready in 123 ms
➜ Local:   http://localhost:5173/
➜ Press r + enter to restart
```

### Passo 3: Testar Real-time

1. **Abra 2 abas** do navegador: `http://localhost:5173`
2. **Console (F12)** deve mostrar:
   ```
   [SocketClient] ✅ Conectado ao backend
   [TodayQueueContext] 📨 Mudança de ticket recebida
   ```
3. **Clique em "Iniciar Atendimento"** em uma aba
4. **Outra aba** deve ver a mudança **instantaneamente** ⚡

## 📋 Arquivos Criados/Modificados

### Novo Backend
```
backend/
├── src/
│   ├── server.ts          ← Servidor principal
│   ├── config.ts          ← Configurações
│   ├── supabase.ts        ← Client Supabase
│   └── websocket.ts       ← Logic de WebSocket
├── package.json
├── tsconfig.json
├── Procfile               ← For Render deployment
└── .env.example
```

### Frontend Atualizado
```
services/
└── SocketClient.ts        ← ✨ NOVO - Gerencia WebSocket

contexts/
└── TodayQueueContext.tsx  ← ✏️ ATUALIZADO - Usa WebSocket

.env.local
└── VITE_BACKEND_URL=http://localhost:3001  ← ✨ NOVO
```

## 📝 Variáveis de Ambiente

### Backend (`backend/.env.local`)
```bash
SUPABASE_URL=https://vrxlaphgwzmtwoweecjp.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env.local`)
```bash
VITE_BACKEND_URL=http://localhost:3001  # Dev
VITE_BACKEND_URL=https://seu-backend.onrender.com  # Prod
```

## 🌍 Deploy no Render

### 1. Push para GitHub
```bash
git add .
git commit -m "Add real-time backend with WebSocket"
git push origin main
```

### 2. Deploy Backend
1. Acesse https://render.com
2. Novo web service
3. Conecte seu repo GitHub
4. Configure:
   - Build: `cd backend && npm install && npm run build`
   - Start: `cd backend && npm start`
5. Add env vars (copie de `backend/.env.example`)
6. Deploy!

### 3. Atualizar Frontend
Após receber URL do backend (ex: `https://jabprev-queue-backend.onrender.com`):
1. Atualize `.env.local`:
   ```bash
   VITE_BACKEND_URL=https://jabprev-queue-backend.onrender.com
   ```
2. Build e deploy frontend

## ✨ Fluxo de Real-time Agora

```
Usuário clica "Iniciar Atendimento"
          ↓
   Frontend → HTTP PUT
          ↓
   Supabase atualiza ticket
          ↓
   Supabase emite evento (postgres_changes)
          ↓
   Backend recebe evento
          ↓
   Backend broadcast via WebSocket
          ↓
   Frontend recebe evento
          ↓
   Estado local atualiza
          ↓
   UI atualiza INSTANTANEAMENTE ⚡
```

## 🆘 Troubleshooting

### Frontend não conecta ao backend
```
[SocketClient] ❌ Erro de conexão: ...
```
**Solução:** Verifique se backend está rodando e `VITE_BACKEND_URL` está correto

### Backend diz "Supabase não configurado"
```
⚠️  Missing SUPABASE_URL in environment variables
```
**Solução:** Preencha `backend/.env.local` com credenciais do Supabase

### Eventos não chegam
- Verifique logs do backend: `[WebSocket] 📨 Evento recebido`
- Verifique se Real-time está ativado no Supabase
- Rodando migrations: `supabase db push` na raiz do projeto

## 📚 Documentação Completa

- [Backend README](docs/BACKEND_README.md) - Detalhes técnicos do backend
- [Diagnóstico Real-time](docs/DIAGNOSTICO_REALTIME.md) - Se tiver problemas
- [Migrações](supabase/migrations/) - SQL migrations para Supabase

## 🎉 Pronto!

Agora você tem:
- ✅ Real-time funcionando com WebSocket
- ✅ Backend pronto para escalar
- ✅ Frontend instantaneamente atualizado
- ✅ Pronto para deploy em produção

**Próximos passos:**
1. Testar localmente (3 passos acima)
2. Deploy no Render
3. Monitorar em produção

Qualquer dúvida, ver `docs/BACKEND_README.md` 📖
