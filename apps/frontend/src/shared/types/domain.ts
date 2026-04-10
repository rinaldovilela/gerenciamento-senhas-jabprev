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

export interface ClientConfig {
  apiUrl: string;
  wsUrl: string;
  environment: 'development' | 'staging' | 'production';
}
