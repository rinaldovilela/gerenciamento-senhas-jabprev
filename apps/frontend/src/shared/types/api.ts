export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: string[];
}
