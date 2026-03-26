export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true,
    public context?: any
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: new Date().toISOString(),
    };
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public details: string[] = []) {
    super(400, message, true);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(401, message, true);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(403, message, true);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message, true);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists') {
    super(409, message, true);
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', error?: any) {
    super(500, message, false, error);
  }
}
