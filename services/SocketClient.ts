import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initializeSocket(backendUrl: string): Socket {
  if (socket) {
    console.log('[SocketClient] Socket já inicializado');
    return socket;
  }

  console.log('[SocketClient] Conectando ao backend:', backendUrl);

  socket = io(backendUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[SocketClient] ✅ Conectado ao backend');
    // Solicita dados iniciais quando conecta
    socket!.emit('request:initial-data', (response: any) => {
      if (response.success) {
        console.log('[SocketClient] 📦 Dados iniciais recebidos');
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('[SocketClient] ❌ Desconectado do backend');
  });

  socket.on('connect_error', (error) => {
    console.error('[SocketClient] ❌ Erro de conexão:', error);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function closeSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[SocketClient] Socket fechado');
  }
}
