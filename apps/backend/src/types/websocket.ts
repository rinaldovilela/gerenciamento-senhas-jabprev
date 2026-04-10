export interface SocketEvents {
  // Client → Server
  'ticket:created': { ticketId: string; service: string };
  'ticket:updated': { ticketId: string; status: string };
  'queue:join': { roomId: string; userId: string };
  'queue:leave': { roomId: string; userId: string };
  'notification:read': { notificationId: string };

  // Server → Client
  'ticket:notified': { ticketId: string; message: string };
  'queue:status': { waiting: number; inService: number };
  'user:connected': { userId: string };
  'user:disconnected': { userId: string };
  'error': { message: string; code: string };
}

export interface SocketUser {
  id: string;
  email: string;
  role: string;
  socketId: string;
  connectedAt: Date;
}

export interface QueueRoom {
  id: string;
  name: string;
  users: Map<string, SocketUser>;
}
