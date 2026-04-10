import { ValidationError } from './errors';

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // At least 8 chars, 1 uppercase, 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

export function validateEmail(email: string): void {
  if (!email || !isValidEmail(email)) {
    throw new ValidationError('Invalid email format', ['email']);
  }
}

export function validatePassword(password: string): void {
  if (!password || !isValidPassword(password)) {
    throw new ValidationError(
      'Password must be at least 8 characters with uppercase and number',
      ['password']
    );
  }
}

export function validateRequired(value: any, fieldName: string): void {
  if (!value) {
    throw new ValidationError(`${fieldName} is required`, [fieldName]);
  }
}

export function validateUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function validatePagination(page?: number, limit?: number) {
  if (page && (page < 1 || !Number.isInteger(page))) {
    throw new ValidationError('Invalid page number', ['page']);
  }

  if (limit && (limit < 1 || limit > 100 || !Number.isInteger(limit))) {
    throw new ValidationError('Limit must be between 1 and 100', ['limit']);
  }

  return {
    page: page || 1,
    limit: limit || 20,
  };
}

export function sanitizeObject(obj: any, allowedKeys: string[]): any {
  return Object.keys(obj)
    .filter((key) => allowedKeys.includes(key))
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {} as any);
}
