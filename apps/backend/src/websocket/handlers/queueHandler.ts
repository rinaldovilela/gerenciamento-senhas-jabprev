import { Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../events';

export function setupQueueHandlers(socket: Socket): void {
  socket.on(SOCKET_EVENTS.QUEUE_JOIN, (data: { roomId: string; userId: string }) => {
    try {
      socket.join(`${SOCKET_ROOMS.QUEUE}:${data.roomId}`);
      logger.info(`User joined queue: ${data.userId} in room ${data.roomId}`);

      socket.to(`${SOCKET_ROOMS.QUEUE}:${data.roomId}`).emit(SOCKET_EVENTS.USER_CONNECTED, {
        userId: data.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Queue join error', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Failed to join queue',
        code: 'QUEUE_JOIN_FAILED',
      });
    }
  });

  socket.on(SOCKET_EVENTS.QUEUE_LEAVE, (data: { roomId: string; userId: string }) => {
    try {
      socket.leave(`${SOCKET_ROOMS.QUEUE}:${data.roomId}`);
      logger.info(`User left queue: ${data.userId} from room ${data.roomId}`);

      socket.to(`${SOCKET_ROOMS.QUEUE}:${data.roomId}`).emit(SOCKET_EVENTS.USER_DISCONNECTED, {
        userId: data.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Queue leave error', error);
    }
  });
}
