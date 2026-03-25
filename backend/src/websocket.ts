import { Server as SocketIOServer, Socket } from 'socket.io';
import { supabase, Ticket, Service, getTodayTickets, getServices } from './supabase.js';
import { config } from './config.js';

let io: SocketIOServer;
let ticketsChannel: any;
let servicesChannel: any;

export async function initializeWebSocket(socketIOInstance: SocketIOServer) {
  io = socketIOInstance;

  console.log('🔌 Inicializando WebSocket listeners...');

  // Setup listeners para tickets
  ticketsChannel = supabase
    .channel('public:tickets')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tickets',
      },
      (payload: any) => {
        console.log('[WebSocket] 📨 Evento de tickets recebido:', {
          tipo: payload.eventType,
          ticketId: payload.new?.id || payload.old?.id,
        });

        // Broadcast para todos os clientes conectados
        io.emit('ticket:change', {
          type: payload.eventType,
          data: payload.new || payload.old,
          timestamp: new Date().toISOString(),
        });
      }
    )
    .subscribe((status) => {
      console.log('[WebSocket] 🔗 Tickets channel status:', status);
    });

  // Setup listeners para services
  servicesChannel = supabase
    .channel('public:services')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'services',
      },
      (payload: any) => {
        console.log('[WebSocket] 📨 Evento de services recebido:', payload.eventType);

        io.emit('service:change', {
          type: payload.eventType,
          data: payload.new || payload.old,
          timestamp: new Date().toISOString(),
        });
      }
    )
    .subscribe((status) => {
      console.log('[WebSocket] 🔗 Services channel status:', status);
    });
}

export async function setupSocketHandlers(socket: Socket) {
  console.log(`✅ Cliente conectado: ${socket.id}`);

  // Cliente solicita dados iniciais
  socket.on('request:initial-data', async (callback) => {
    try {
      const tickets = await getTodayTickets();
      const services = await getServices();

      console.log(`📦 Enviando dados iniciais para ${socket.id}:`, {
        tickets: tickets.length,
        services: services.length,
      });

      callback({
        success: true,
        data: {
          tickets,
          services,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('❌ Erro ao buscar dados iniciais:', error);
      callback({
        success: false,
        error: 'Failed to fetch initial data',
      });
    }
  });

  // Cliente se desconecta
  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });

  // Heartbeat/ping para manter conexão viva
  socket.on('ping', () => {
    socket.emit('pong');
  });
}

export async function closeWebSocket() {
  console.log('🛑 Fechando WebSocket listeners...');

  if (ticketsChannel) {
    await ticketsChannel.unsubscribe();
  }

  if (servicesChannel) {
    await servicesChannel.unsubscribe();
  }
}
