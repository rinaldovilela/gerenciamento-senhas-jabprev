import { config } from './environment';

const API_BASE_URL = `${config.apiUrl}/api/v1`;

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: string[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private static token: string | null = null;

  private static async parseResponseBody(response: Response): Promise<any> {
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    const text = await response.text();
    return text || null;
  }

  static setToken(token: string) {
    this.token = token;
  }

  static async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    const body = await this.parseResponseBody(response);

    if (!response.ok) {
      const message =
        (body && typeof body === 'object' && (body.error || body.message)) ||
        (typeof body === 'string' && body) ||
        'API request failed';
      const details = body && typeof body === 'object' && Array.isArray(body.details)
        ? body.details
        : undefined;
      throw new ApiError(message, response.status, details);
    }

    return body as T;
  }

  // Auth endpoints
  static async register(email: string, password: string, name: string) {
    return this.request('POST', '/auth/register', { email, password, name });
  }

  static async login(email: string, password: string) {
    return this.request('POST', '/auth/login', { email, password });
  }

  static async logout() {
    return this.request('POST', '/auth/logout');
  }

  // Queue endpoints
  static async createTicket(data: { service: string; priority?: string; description?: string }) {
    return this.request('POST', '/queue/tickets', data);
  }

  static async listTickets(filters?: { status?: string; service?: string }) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request('GET', `/queue/tickets${params ? `?${params}` : ''}`);
  }

  static async getTicket(id: string) {
    return this.request('GET', `/queue/tickets/${id}`);
  }

  static async updateTicket(id: string, data: any) {
    return this.request('PATCH', `/queue/tickets/${id}`, data);
  }

  static async deleteTicket(id: string) {
    return this.request('DELETE', `/queue/tickets/${id}`);
  }

  // Admin endpoints
  static async getDashboard() {
    return this.request('GET', '/admin/dashboard');
  }

  static async getMetrics() {
    return this.request('GET', '/admin/metrics');
  }

  static async listUsers(filters?: { role?: string; status?: string }) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request('GET', `/admin/users${params ? `?${params}` : ''}`);
  }

  static async createUser(data: any) {
    return this.request('POST', '/admin/users', data);
  }

  static async updateUser(id: string, data: any) {
    return this.request('PATCH', `/admin/users/${id}`, data);
  }

  static async deleteUser(id: string) {
    return this.request('DELETE', `/admin/users/${id}`);
  }

  static async uploadAvatar(id: string, fileData: string, fileName: string): Promise<{ publicUrl: string }> {
    return this.request('POST', `/admin/users/${id}/avatar`, { fileData, fileName });
  }

  static async updateProfile(data: any): Promise<{ user: any; token: string }> {
    return this.request('PATCH', '/auth/profile', data);
  }

  static async uploadProfileAvatar(fileData: string, fileName: string): Promise<{ publicUrl: string }> {
    return this.request('POST', '/auth/profile/avatar', { fileData, fileName });
  }
}
