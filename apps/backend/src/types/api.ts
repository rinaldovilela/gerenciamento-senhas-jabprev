export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

export interface CreateTicketRequest {
  service: string;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
}

export interface UpdateTicketRequest {
  status?: string;
  attendantId?: string;
  notes?: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export interface DashboardResponse {
  totalUsers: number;
  totalTickets: number;
  ticketsInService: number;
  completedToday: number;
}

export interface ErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
  details?: string[];
}
