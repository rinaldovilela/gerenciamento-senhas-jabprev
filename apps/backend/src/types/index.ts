export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'operator' | 'admin';
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  service: string;
  priority: 'low' | 'medium' | 'high';
  status: 'waiting' | 'in_service' | 'completed' | 'canceled';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  ticketId: string;
  attendantId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'ticket_created' | 'ticket_updated' | 'ticket_completed' | 'system';
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: string;
}
