// Generic validation utilities for primitive types

import { ProtocardId, DateString } from '@/server/db/types';
import { MessageID } from '@/shared/types/responses';

// Base validation error types
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Generic validation functions for primitive types
export namespace GenericValidation {
  
  // String validation
  export function validateString(value: unknown, fieldName = 'field'): string {
    if (typeof value !== 'string') {
      throw new ValidationError(`${fieldName} must be a string`, fieldName);
    }
    return value;
  }

  export function validateNonEmptyString(value: unknown, fieldName = 'field'): string {
    const str = validateString(value, fieldName);
    if (str.trim().length === 0) {
      throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
    }
    return str.trim();
  }

  export function validateStringWithLength(value: unknown, maxLength: number, fieldName = 'field'): string {
    const str = validateNonEmptyString(value, fieldName);
    if (str.length > maxLength) {
      throw new ValidationError(`${fieldName} cannot exceed ${maxLength} characters`, fieldName);
    }
    return str;
  }

  // Number validation
  export function validateNumber(value: unknown, fieldName = 'field'): number {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError(`${fieldName} must be a valid number`, fieldName);
    }
    return value;
  }

  export function validatePositiveNumber(value: unknown, fieldName = 'field'): number {
    const num = validateNumber(value, fieldName);
    if (num <= 0) {
      throw new ValidationError(`${fieldName} must be a positive number`, fieldName);
    }
    return num;
  }

  export function validateInteger(value: unknown, fieldName = 'field'): number {
    const num = validateNumber(value, fieldName);
    if (!Number.isInteger(num)) {
      throw new ValidationError(`${fieldName} must be an integer`, fieldName);
    }
    return num;
  }

  export function validatePositiveInteger(value: unknown, fieldName = 'field'): number {
    const num = validateInteger(value, fieldName);
    if (num <= 0) {
      throw new ValidationError(`${fieldName} must be a positive integer`, fieldName);
    }
    return num;
  }

  // Parse string to number
  export function parseStringToNumber(value: unknown, fieldName = 'field'): number {
    if (typeof value === 'number') {
      return validateNumber(value, fieldName);
    }
    if (typeof value !== 'string') {
      throw new ValidationError(`${fieldName} must be a string or number`, fieldName);
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new ValidationError(`${fieldName} must be a valid number`, fieldName);
    }
    return parsed;
  }

  export function parseStringToPositiveInteger(value: unknown, fieldName = 'field'): number {
    const num = parseStringToNumber(value, fieldName);
    if (num <= 0) {
      throw new ValidationError(`${fieldName} must be a positive number`, fieldName);
    }
    return num;
  }

  // Date validation
  export function validateISODateString(value: unknown, fieldName = 'field'): string {
    const str = validateString(value, fieldName);
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (!regex.test(str)) {
      throw new ValidationError(`${fieldName} must be a valid ISO date string`, fieldName);
    }
    return str;
  }

  // Object validation
  export function validateObject(value: unknown, fieldName = 'field'): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new ValidationError(`${fieldName} must be an object`, fieldName);
    }
    return value as Record<string, unknown>;
  }

  // Optional validation
  export function validateOptional<T>(
    value: unknown, 
    validator: (val: unknown, field: string) => T,
    fieldName = 'field'
  ): T | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    return validator(value, fieldName);
  }
}

// Branded type validators (using generic validators)
export namespace BrandedTypeValidation {
  
  export function validateProtocardId(value: unknown, fieldName = 'id'): ProtocardId {
    let num: number;
    
    if (typeof value === 'number') {
      num = GenericValidation.validatePositiveInteger(value, fieldName);
    } else if (typeof value === 'string') {
      num = GenericValidation.parseStringToPositiveInteger(value, fieldName);
    } else {
      throw new ValidationError(`${fieldName} must be a number or string`, fieldName);
    }
    
    return num as ProtocardId;
  }

  export function validateDateString(value: unknown, fieldName = 'date'): DateString {
    const str = GenericValidation.validateISODateString(value, fieldName);
    return str as DateString;
  }

  export function validateMessageID(value: unknown, fieldName = 'id'): MessageID {
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new ValidationError(`${fieldName} must be a string or number`, fieldName);
    }
    return value as MessageID;
  }

  export function validateOptionalMessageID(value: unknown, fieldName = 'id'): MessageID | undefined {
    return GenericValidation.validateOptional(value, validateMessageID, fieldName);
  }
}