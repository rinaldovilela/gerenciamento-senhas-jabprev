/**
 * roku.ws.ts
 * ─────────────────────────────────────────────────────────
 * Adicione este arquivo na pasta src/ do seu backend.
 *
 * Cria um endpoint WebSocket NATIVO em /roku-ws que espelha
 * os eventos do Socket.IO para a Roku TV.
 * (A Roku não suporta Socket.IO — só WebSocket puro.)
 *
 * CORS não se aplica a WebSocket nativo. ✅
 *
 * ── COMO INTEGRAR ────────────────────────────────────────
 * No seu main.ts / server.ts, após criar httpServer e io:
 *
 *   import { mountRokuWs } from './roku.ws';
 *   mountRokuWs(httpServer, io);
 *
 * ── DEPENDÊNCIA ──────────────────────────────────────────
 *   npm install ws
 *   npm install -D @types/ws
 * ─────────────────────────────────────────────────────────
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer } from 'http';
import type { Server as SocketIOServer } from 'socket.io';

export function mountRokuWs(httpServer: HttpServer, io: SocketIOServer): void {
  const wss = new WebSocketServer({ server: httpServer, path: '/roku-ws' });
  const clients = new Set<WebSocket>();

  console.log('[RokuWS] ✅ Endpoint ws://...:/roku-ws ativo');

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`[RokuWS] Roku conectada — total: ${clients.size}`);

    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'JaboataoPrev OK' }));

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'PING') ws.send(JSON.stringify({ type: 'PONG' }));
      } catch { /* ignora */ }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[RokuWS] Roku desconectada — total: ${clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[RokuWS] Erro:', err.message);
      clients.delete(ws);
    });
  });

  // Espelha ticket:change do Socket.IO → Roku
  io.on('connection', (socket) => {
    socket.onAny((event, ...args) => {
      if (event !== 'ticket:change') return;

      const payload = JSON.stringify({ event, data: args[0] });

      clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(payload);
      });
    });
  });
}
