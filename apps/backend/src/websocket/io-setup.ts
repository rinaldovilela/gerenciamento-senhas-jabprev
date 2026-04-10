import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

let io: SocketIOServer;

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  const allowedOrigins = config.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS`));
      },
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error: ${socket.id}`, error);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function emitToRoom(room: string, event: string, data: any): void {
  io.to(room).emit(event, data);
}

export function emitToUser(userId: string, event: string, data: any): void {
  io.to(userId).emit(event, data);
}

export function emitToAll(event: string, data: any): void {
  io.emit(event, data);
}
