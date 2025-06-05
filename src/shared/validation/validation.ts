// Generic validation utilities for primitive types

import { DateString } from '@/shared/types/db';
import { ProtocardId } from '@/shared/types/id-prefixes';
import { MessageID } from '@/shared/types/responses';
import {
  IDGenerator,
  ID_PREFIXES,
  PrefixedId,
  type IDPrefix,
  type PrefixedProtocardId,
} from '@/shared/types/id-prefixes';

// Base validation error types
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Generic validation functions for primitive types
export namespace GenericValidation {
  // boolean
  export function validateBoolean(
    value: unknown,
    fieldName = 'field'
  ): boolean {
    if (typeof value !== 'boolean') {
      throw new ValidationError(
        `${fieldName} must be a boolean. Got: ${JSON.stringify(value)}`,
        fieldName
      );
    }
    return value;
  }

  // String validation
  export function validateString(value: unknown, fieldName = 'field'): string {
    if (typeof value !== 'string') {
      throw new ValidationError(
        `${fieldName} must be a string. Got: ${JSON.stringify(value)}`,
        fieldName
      );
    }
    return value;
  }

  export function validateNonEmptyString(
    value: unknown,
    fieldName = 'field'
  ): string {
    const str = validateString(value, fieldName);
    if (str.trim().length === 0) {
      throw new ValidationError(
        `${fieldName} cannot be empty. Got: ${JSON.stringify(value)}`,
        fieldName
      );
    }
    return str.trim();
  }

  export function validateStringWithLength(
    value: unknown,
    maxLength: number,
    fieldName = 'field'
  ): string {
    const str = validateNonEmptyString(value, fieldName);
    if (str.length > maxLength) {
      throw new ValidationError(
        `${fieldName} cannot exceed ${maxLength} characters. Got: ${JSON.stringify(value)} (length: ${str.length})`,
        fieldName
      );
    }
    return str;
  }

  // Number validation
  export function validateNumber(value: unknown, fieldName = 'field'): number {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError(
        `${fieldName} must be a valid number. Got: ${JSON.stringify(value)}`,
        fieldName
      );
    }
    return value;
  }

  export function validatePositiveNumber(
    value: unknown,
    fieldName = 'field'
  ): number {
    const num = validateNumber(value, fieldName);
    if (num <= 0) {
      throw new ValidationError(
        `${fieldName} must be a positive number. Got: ${JSON.stringify(value)}`,
        fieldName
      );
    }
    return num;
  }

  export function validateInteger(value: unknown, fieldName = 'field'): number {
    const num = validateNumber(value, fieldName);
    if (!Number.isInteger(num)) {
      throw new ValidationError(
        `${fieldName} must be an integer. Got: ${JSON.stringify(value)}`,
        fieldName
      );
    }
    return num;
  }

  export function validatePositiveInteger(
    value: unknown,
    fieldName = 'field'
  ): number {
    const num = validateInteger(value, fieldName);
    if (num <= 0) {
      throw new ValidationError(
        `${fieldName} must be a positive integer. Got: ${JSON.stringify(value)}`,
        fieldName
      );
    }
    return num;
  }

  // Parse string to number
  export function parseStringToNumber(
    value: unknown,
    fieldName = 'field'
  ): number {
    if (typeof value === 'number') {
      return validateNumber(value, fieldName);
    }
    if (typeof value !== 'string') {
      throw new ValidationError(
        `${fieldName} must be a string or number. Got: ${JSON.stringify(value)}`,
        fieldName
      );
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new ValidationError(
        `${fieldName} must be a valid number. Got: ${JSON.stringify(value)}`,
        fieldName
      );
    }
    return parsed;
  }

  export function parseStringToPositiveInteger(
    value: unknown,
    fieldName = 'field'
  ): number {
    const num = parseStringToNumber(value, fieldName);
    if (num <= 0) {
      throw new ValidationError(
        `${fieldName} must be a positive number. Got: ${JSON.stringify(value)}`,
        fieldName
      );
    }
    return num;
  }

  // Date validation
  export function validateISODateString(
    value: unknown,
    fieldName = 'field'
  ): string {
    const str = validateString(value, fieldName);
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (!regex.test(str)) {
      throw new ValidationError(
        `${fieldName} must be a valid ISO date string. Got: "${str}"`,
        fieldName
      );
    }
    return str;
  }

  // Object validation
  export function validateObject(
    value: unknown,
    fieldName = 'field'
  ): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new ValidationError(
        `${fieldName} must be an object. Got: ${JSON.stringify(value)}`,
        fieldName
      );
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
  export function validateProtocardId(
    value: unknown,
    fieldName = 'id'
  ): ProtocardId {
    let num: number;

    if (typeof value === 'number') {
      num = GenericValidation.validatePositiveInteger(value, fieldName);
    } else if (typeof value === 'string') {
      num = GenericValidation.parseStringToPositiveInteger(value, fieldName);
    } else {
      throw new ValidationError(
        `${fieldName} must be a number or string. Got: ${JSON.stringify(value)}`,
        fieldName
      );
    }

    return num as ProtocardId;
  }

  export function validateDateString(
    value: unknown,
    fieldName = 'date'
  ): DateString {
    const str = GenericValidation.validateISODateString(value, fieldName);
    return str as DateString;
  }

  export function validateMessageID(
    value: unknown,
    fieldName = 'id'
  ): MessageID {
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new ValidationError(
        `${fieldName} must be a string or number. Got: ${JSON.stringify(value)}`,
        fieldName
      );
    }
    return value as MessageID;
  }

  /**
   * Validate a prefixed ID with specific prefix requirement
   */
  export function validatePrefixedId<T extends IDPrefix>(
    value: unknown,
    expectedPrefix: T,
    fieldName = 'id'
  ): PrefixedId<T> {
    const str = GenericValidation.validateString(value, fieldName);

    if (!IDGenerator.validatePrefix(str, expectedPrefix)) {
      throw new ValidationError(
        `${fieldName} must start with prefix "${expectedPrefix}". Got: "${str}"`,
        fieldName
      );
    }

    return str as PrefixedId<T>;
  }

  /**
   * Validate a protocard ID with correct prefix (new prefixed version)
   */
  export function validatePrefixedProtocardId(
    value: unknown,
    fieldName = 'protocardId'
  ): PrefixedProtocardId {
    return validatePrefixedId(value, ID_PREFIXES.PROTOCARD, fieldName);
  }

  export function validateOptionalMessageID(
    value: unknown,
    fieldName = 'id'
  ): MessageID | undefined {
    return GenericValidation.validateOptional(
      value,
      validateMessageID,
      fieldName
    );
  }
}
