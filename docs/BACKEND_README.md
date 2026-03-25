# 🚀 Backend de Real-time - Documentação

## Visão Geral

Backend Node.js com WebSocket que gerencia eventos em tempo real do Supabase para a aplicação de fila de atendimento.

## Arquitetura

```
Backend (Node.js + Socket.IO)
    ↓
    ├─ Supabase Real-time (ouve eventos)
    ├─ WebSocket listeners (tickets, services)
    └─ Broadcasting para clientes Angular/React
```

## Instalação Local

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Criar `.env.local`
```bash
cp .env.example .env.local
```

Preencha com suas credenciais do Supabase:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Executar em desenvolvimento
```bash
npm run dev
```

Esperado:
```
╔════════════════════════════════════════════╗
║   🚀 JABPREV Queue Backend Iniciado       ║
╠════════════════════════════════════════════╣
║ 📡 WebSocket: ws://localhost:3001
║ 🔗 HTTP: http://localhost:3001
║ 📦 CORS: http://localhost:5173
║ 🌍 Environment: development
╚════════════════════════════════════════════╝
```

## API WebSocket

### Eventos Enviados pelo Cliente

#### `request:initial-data`
Solicita dados iniciais (tickets e services de hoje)

```javascript
socket.emit('request:initial-data', (response) => {
  if (response.success) {
    console.log('Tickets:', response.data.tickets);
    console.log('Services:', response.data.services);
  }
});
```

#### `ping`
Heartbeat para manter conexão viva (opcional, mantém conexão ativa)

```javascript
socket.emit('ping');
socket.on('pong', () => {
  console.log('Connection alive');
});
```

### Eventos Recebidos pelo Cliente

#### `ticket:change`
Evento quando um ticket é criado/atualizado/deletado

```javascript
socket.on('ticket:change', (event) => {
  console.log('Tipo:', event.type); // 'INSERT', 'UPDATE', 'DELETE'
  console.log('Dados:', event.data); // Ticket object
  console.log('Timestamp:', event.timestamp);
});
```

#### `service:change`
Evento quando um serviço é criado/atualizado/deletado

```javascript
socket.on('service:change', (event) => {
  console.log('Tipo:', event.type);
  console.log('Dados:', event.data);
});
```

## HTTP Endpoints

### `GET /health`
Status básico do servidor

```bash
curl http://localhost:3001/health
```

Resposta:
```json
{
  "status": "ok",
  "timestamp": "2024-03-25T12:00:00.000Z",
  "environment": "development"
}
```

### `GET /api/status`
Status detalhado incluindo número de clientes conectados

```bash
curl http://localhost:3001/api/status
```

Resposta:
```json
{
  "server": "running",
  "websocket": "connected",
  "connectedClients": 5,
  "timestamp": "2024-03-25T12:00:00.000Z"
}
```

## Deployment no Render

### 1. Upload para GitHub
```bash
git add .
git commit -m "Add backend"
git push origin main
```

### 2. Conectar no Render
1. Acesse https://render.com
2. Clique em "New +"
3. Selecione "Web Service"
4. Conecte seu repositório GitHub
5. Configure:
   - **Name:** `jabprev-queue-backend`
   - **Runtime:** `Node`
   - **Build Command:** `cd backend && npm install && npm run build`
   - **Start Command:** `cd backend && npm start`

### 3. Variáveis de Ambiente
Na aba "Environment", adicione:
```
PORT=3001
NODE_ENV=production
SUPABASE_URL=seu_url
SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
FRONTEND_URL=url_do_seu_frontend_em_producao
```

### 4. Deploy
Clique em "Deploy" e aguarde (2-5 min)

Você receberá uma URL como: `https://jabprev-queue-backend.onrender.com`

## Integração com Frontend

A aplicação React foi atualizada para:
1. Conectar ao WebSocket backend
2. Receber eventos em tempo real
3. Atualizar o estado localmente

Variável de ambiente necessária:
```
VITE_BACKEND_URL=http://localhost:3001  # Dev
VITE_BACKEND_URL=https://jabprev-queue-backend.onrender.com  # Prod
```

## Troubleshooting

### ❌ WebSocket não conecta
- Verifique se backend está rodando: `curl http://localhost:3001/health`
- Verifique CORS: Frontend URL deve estar em `FRONTEND_URL`
- Verifique firewall: Porta 3001 deve estar aberta

### ❌ Eventos não chegando
- Verifique logs do backend: deve ver `📨 Evento de tickets recebido`
- Verifique se Supabase Real-time está ativado
- Verifique permissões do `SUPABASE_SERVICE_ROLE_KEY`

### ❌ Erro de conexão ao Supabase
- Verifique `SUPABASE_URL` e chaves estão corretas
- Verifique se Supabase project está acessível
- Check se credentials têm permissão para acessar tabelas

## Performance

- **Conexões simultâneas:** ~200+ (limitado pelo plano Render)
- **Latência WebSocket:** ~50-100ms
- **Throughput:** ~1000 eventos/segundo

Para mais conexões, upgrade para Render Paid Plan.

## Logs

Logs são enviados para stdout (visível no Render Dashboard):
```
[WebSocket] 📨 Evento de tickets recebido: UPDATE
[WebSocket] ✅ Broadcasting para 5 clientes
✅ Cliente conectado: socket-id-xxx
```

## Maintainance

### Build
```bash
npm run build
```

### Type checking
```bash
npm run typecheck
```

### Dev mode com auto-reload
```bash
npm run dev
```
