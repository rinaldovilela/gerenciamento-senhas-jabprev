# ✅ Backend Real-time - PRONTO PARA USO

## 🎯 Status Atual

- ✅ Backend Node.js rodando na porta **3001**
- ✅ WebSocket listeners ativos (SUBSCRIBED)
- ✅ Supabase real-time conectado  
- ✅ CORS configurado para frontend

---

## 🚀 Como Começar (2 Terminais)

### Terminal 1: Backend
```bash
cd c:\Users\GerênciadeInvestimen\Desktop\gerenciamento-senhas-jabprev\backend
npm run dev
```

Esperado:
```
🔌 Inicializando WebSocket listeners...

╔════════════════════════════════════════════╗
║   🚀 JABPREV Queue Backend Iniciado       ║
╠════════════════════════════════════════════╣
║ 📡 WebSocket: ws://localhost:3001
║ 🔗 HTTP: http://localhost:3001
║ 📦 CORS: http://localhost:5173
║ 🌍 Environment: development
╚════════════════════════════════════════════╝

[WebSocket] 🔗 Tickets channel status: SUBSCRIBED
[WebSocket] 🔗 Services channel status: SUBSCRIBED
```

### Terminal 2: Frontend
```bash
cd c:\Users\GerênciadeInvestimen\Desktop\gerenciamento-senhas-jabprev
npm run dev
```

Esperado:
```
VITE v6.4.1  ready in 123 ms

➜  Local:   http://localhost:5173/
➜  press r + enter to restart
```

### Browser: Testar Real-time
1. **Abra 2 abas**: `http://localhost:5173`
2. **Console (F12)** - procure por:
   ```
   [SocketClient] ✅ Conectado ao backend
   ```
3. **Aba 1**: Clique em "Iniciar Atendimento"
4. **Aba 2**: Veja atualizar **instantaneamente** ⚡

---

## 📊 Arquitetura Atual

```
┌──────────────────┐         ┌──────────────────┐
│   REAACT AAAA 1  │         │   REACT  APP 2   │
│   (porta 5173)   │         │   (porta 5173)   │
└────────┬─────────┘         └────────┬─────────┘
         │                           │
         │ WebSocket                │ WebSocket
         ▼                           ▼
    ┌────────────────────────────────────┐
    │  Backend Socket.IO                 │
    │  (porta 3001)                      │
    │                                    │
    │  ✅ Ouve Supabase real-time        │
    │  ✅ Broadcast para clientes        │
    └────────────┬─────────────────────┘
                 │ postgres_changes
                 ▼
        ┌────────────────────┐
        │  SUPABASE          │
        │  (PostgreSQL)      │
        │                    │
        │  Realtime enabled  │
        └────────────────────┘
```

---

## 🧪 Testar Endpoints

### Health Check
```bash
# PowerShell
node -e "require('http').get('http://localhost:3001/health', (r) => { let d=''; r.on('data', c=>d+=c); r.on('end', ()=>console.log(d)); })"

# Resposta esperada:
# {"status":"ok","timestamp":"2026-03-25T15:12:59.253Z","environment":"development"}
```

### Status Detalhado
```bash
node -e "require('http').get('http://localhost:3001/api/status', (r) => { let d=''; r.on('data', c=>d+=c); r.on('end', ()=>console.log(d)); })"

# Resposta esperada:
# {"server":"running","websocket":"connected","connectedClients":2,"timestamp":"..."}
```

---

## 📋 Arquivos Importantes

```
backend/
├── src/
│   ├── server.ts          ← Servidor principal
│   ├── config.ts          ← ✅ CORRIGIDO - carrega .env.local
│   ├── supabase.ts        ← Listeners do Supabase
│   └── websocket.ts       ← WebSocket handlers
├── .env.local             ← ✅ Preenchido com credenciais
├── package.json
└── tsconfig.json

services/
└── SocketClient.ts        ← Cliente WebSocket (frontend)

contexts/
└── TodayQueueContext.tsx  ← Atualizado para usar WebSocket

.env.local                 ← ✅ VITE_BACKEND_URL=http://localhost:3001
```

---

## 🔧 Configuração

### Backend (`.env.local` - já preenchido)
```bash
PORT=3001
NODE_ENV=development

SUPABASE_URL=https://vrxlaphgwzmtwoweecjp.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env.local` - já preenchido)
```bash
VITE_BACKEND_URL=http://localhost:3001  # Dev
```

---

## ✨ Fluxo de Real-time em Ação

```
Usuário clica "Iniciar Atendimento" em TAB 1
              ↓
        Frontend (TAB 1)
         UPDATE ticket
              ↓
         Supabase
      atualiza banco
              ↓
     postgres_changes
        evento emitido
              ↓
         Backend
   recebe o evento
              ↓
       io.emit()
    broadcast para
      todos os clientes
              ↓
     Frontend (TAB 2)
  recebe o evento
              ↓
   Atualiza estado local
              ↓
         UI ATUALIZA
            ⚡ INSTANTANEAMENTE
```

---

## 🆘 Se Não Funcionar

### Backend não inicia
```bash
# Verificar se porta 3001 está ocupada
netstat -ano | findstr :3001

# Se estiver, matar o processo:
taskkill /PID [PID] /F
```

### Frontend não conecta ao backend
- Verifique se backend está rodando em porta 3001
- Verifique  console (F12) do navegador:
  ```
  [SocketClient] ❌ Erro de conexão: ...
  ```
- Verifique `.env.local`: `VITE_BACKEND_URL=http://localhost:3001`

### Eventos não chegam
- Verifique logs do backend:
  ```
  [WebSocket] 📨 Evento de tickets recebido
  ```
- Verifique logs do frontend (F12):
  ```
  [TodayQueueContext] 📨 Mudança de ticket recebida
  ```
- Se não ver eventos, Supabase real-time pode não estar ativado

---

## 📚 Documentação Completa

- `docs/COMECANDO_RAPIDO.md` - Início rápido
- `docs/BACKEND_README.md` - Referência técnica
- `docs/IMPLEMENTACAO_COMPLETA.md` - Detalhes de implementação

---

## 🌍 Próximo: Deploy no Render

Quando estiver pronto para produção, ver:
- Push no GitHub
- Criar Web Service no Render
- Add environment variables
- Deploy! 🚀

---

✅ **Tudo funcionando! Comece pelos 2 terminais acima.**
