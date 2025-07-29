/**
 * Input validation utilities for enhanced security
 */

import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email().max(254);
export const passwordSchema = z.string().min(8).max(128);
export const uuidSchema = z.string().uuid();
export const nameSchema = z.string().min(1).max(100).trim();
export const textContentSchema = z.string().max(10000).trim();
export const urlSchema = z.string().url().max(2048);

// Role validation
export const roleSchema = z.enum(['viewer', 'special', 'admin', 'superadmin']);

// Sanitization functions
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255);
};

// Input validation functions
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  try {
    emailSchema.parse(email);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid email format' };
  }
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  try {
    passwordSchema.parse(password);
    
    // Additional security checks
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one special character' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Password must be between 8 and 128 characters' };
  }
};

export const validateRole = (role: string): { isValid: boolean; error?: string } => {
  try {
    roleSchema.parse(role);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid role' };
  }
};

export const validateUUID = (uuid: string): { isValid: boolean; error?: string } => {
  try {
    uuidSchema.parse(uuid);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid UUID format' };
  }
};

export const validateTextContent = (content: string): { isValid: boolean; error?: string } => {
  try {
    textContentSchema.parse(content);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Content too long or invalid' };
  }
};

// File validation
export const validateFileType = (fileName: string, allowedTypes: string[]): { isValid: boolean; error?: string } => {
  const extension = fileName.toLowerCase().split('.').pop();
  
  if (!extension || !allowedTypes.includes(extension)) {
    return { isValid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }
  
  return { isValid: true };
};

export const validateFileSize = (size: number, maxSizeMB: number): { isValid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (size > maxSizeBytes) {
    return { isValid: false, error: `File too large. Maximum size: ${maxSizeMB}MB` };
  }
  
  return { isValid: true };
};

// Rate limiting helpers
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Create rate limiters for different operations
export const authLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute
export const uploadLimiter = new RateLimiter(10, 60 * 1000); // 10 uploads per minute

// Comprehensive validation for user input
export const validateUserInput = (input: {
  email?: string;
  password?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  content?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (input.email) {
    const emailResult = validateEmail(input.email);
    if (!emailResult.isValid && emailResult.error) {
      errors.push(emailResult.error);
    }
  }
  
  if (input.password) {
    const passwordResult = validatePassword(input.password);
    if (!passwordResult.isValid && passwordResult.error) {
      errors.push(passwordResult.error);
    }
  }
  
  if (input.role) {
    const roleResult = validateRole(input.role);
    if (!roleResult.isValid && roleResult.error) {
      errors.push(roleResult.error);
    }
  }
  
  if (input.firstName) {
    try {
      nameSchema.parse(input.firstName);
    } catch {
      errors.push('First name is invalid');
    }
  }
  
  if (input.lastName) {
    try {
      nameSchema.parse(input.lastName);
    } catch {
      errors.push('Last name is invalid');
    }
  }
  
  if (input.content) {
    const contentResult = validateTextContent(input.content);
    if (!contentResult.isValid && contentResult.error) {
      errors.push(contentResult.error);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};