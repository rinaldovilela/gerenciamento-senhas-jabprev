// Frontend shared types (re-export from shared/types)
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

export interface Service {
  id: string;
  name: string;
  description?: string;
}

export enum UserType {
  REGULAR = 'regular',
  PRIORITY = 'priority',
  VIP = 'vip',
}

export enum Screen {
  HOME = 'HOME',
  LOGIN = 'LOGIN',
  SERVICE_SELECTION = 'SERVICE_SELECTION',
  PRIORITY_SELECTION = 'PRIORITY_SELECTION',
  USER_TYPE_SELECTION = 'USER_TYPE_SELECTION',
  ATTENDANCE_TRACKING = 'ATTENDANCE_TRACKING',
  TICKET = 'TICKET',
  ADMIN = 'ADMIN',
  PUBLIC_DISPLAY = 'PUBLIC_DISPLAY',
  METRICS = 'METRICS',
  RESTRICTED = 'RESTRICTED',
}

export interface ClientConfig {
  apiUrl: string;
  wsUrl: string;
  environment: 'development' | 'staging' | 'production';
}
