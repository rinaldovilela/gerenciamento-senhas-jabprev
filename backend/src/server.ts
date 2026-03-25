import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { config } from './config.js';
import { initializeWebSocket, setupSocketHandlers, closeWebSocket } from './websocket.js';

const app = express();
const httpServer = createServer(app);

// Socket.IO com CORS configurado
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Middleware
app.use(cors({ origin: config.FRONTEND_URL }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// Endpoint para obter status do servidor
app.get('/api/status', (req, res) => {
  res.json({
    server: 'running',
    websocket: 'connected',
    connectedClients: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
  });
});

// WebSocket connection handler
io.on('connection', (socket) => {
  setupSocketHandlers(socket);
});

// Initialize WebSocket listeners
initializeWebSocket(io);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Recebido SIGINT, encerrando gracefully...');
  await closeWebSocket();
  io.close();
  httpServer.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

// Start server
const PORT = config.PORT;
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🚀 JABPREV Queue Backend Iniciado       ║
╠════════════════════════════════════════════╣
║ 📡 WebSocket: ws://localhost:${PORT}
║ 🔗 HTTP: http://localhost:${PORT}
║ 📦 CORS: ${config.FRONTEND_URL}
║ 🌍 Environment: ${config.NODE_ENV}
╚════════════════════════════════════════════╝
  `);
});

export default httpServer;
