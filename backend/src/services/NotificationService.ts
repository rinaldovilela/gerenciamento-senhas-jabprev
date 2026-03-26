import { AppError } from '../middleware/errorHandler';

export interface Notification {
  id: string;
  userId: string;
  type: 'ticket_created' | 'ticket_updated' | 'ticket_completed' | 'system';
  message: string;
  read: boolean;
  createdAt: string;
}

// In-memory notification queue (in production, use Redis or a proper queue)
const notificationQueue = new Map<string, Notification[]>();

export async function sendNotification(payload: {
  userId: string;
  type: string;
  message: string;
}): Promise<Notification> {
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random()}`,
    userId: payload.userId,
    type: payload.type as any,
    message: payload.message,
    read: false,
    createdAt: new Date().toISOString(),
  };

  if (!notificationQueue.has(payload.userId)) {
    notificationQueue.set(payload.userId, []);
  }

  notificationQueue.get(payload.userId)!.push(notification);

  return notification;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  return notificationQueue.get(userId) || [];
}

export async function markAsRead(notificationId: string): Promise<Notification> {
  for (const notifications of notificationQueue.values()) {
    const notif = notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
      return notif;
    }
  }

  throw new AppError(404, 'Notification not found');
}

export async function clearNotifications(userId: string): Promise<void> {
  notificationQueue.delete(userId);
}
