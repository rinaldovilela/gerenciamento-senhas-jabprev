export const SOCKET_EVENTS = {
  // Client → Server
  TICKET_CREATED: 'ticket:created',
  TICKET_UPDATED: 'ticket:updated',
  QUEUE_JOIN: 'queue:join',
  QUEUE_LEAVE: 'queue:leave',
  NOTIFICATION_READ: 'notification:read',
  ATTENDANCE_START: 'attendance:start',
  ATTENDANCE_END: 'attendance:end',

  // Server → Client
  TICKET_NOTIFIED: 'ticket:notified',
  QUEUE_STATUS: 'queue:status',
  USER_CONNECTED: 'user:connected',
  USER_DISCONNECTED: 'user:disconnected',
  ATTENDANCE_STARTED: 'attendance:started',
  ATTENDANCE_COMPLETED: 'attendance:completed',
  ERROR: 'error',
} as const;

export const SOCKET_ROOMS = {
  QUEUE: 'queue',
  NOTIFICATIONS: 'notifications',
  ADMIN: 'admin',
  PUBLIC_DISPLAY: 'public_display',
} as const;
