/**
 * Composable field validators for DynamicForm.
 *
 * Each factory returns a `FieldValidator`: `(value, values) => string | null | undefined`.
 * Attach one or more to a field via `field.validators`, and/or combine several into one
 * function with `composeValidators`. They run after `required`, in order, and validation
 * stops at the first error.
 *
 * @example
 * {
 *   name: 'password',
 *   type: 'password',
 *   required: true,
 *   validators: [minLength(8), pattern(/[0-9]/, 'Must contain a digit')],
 * }
 */
import type { DynamicFormValues, FieldValidator } from './types';

function length(value: unknown): number {
  if (typeof value === 'string') return value.length;
  if (Array.isArray(value)) return value.length;
  return 0;
}

function isPresent(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/** String/array length must be >= min. Skips empty values — pair with `required` to also enforce presence. */
export function minLength<T = DynamicFormValues>(min: number, message?: string): FieldValidator<T> {
  return (value) => {
    if (!isPresent(value)) return null;
    return length(value) < min ? (message ?? `Must be at least ${min} characters.`) : null;
  };
}

/** String/array length must be <= max. */
export function maxLength<T = DynamicFormValues>(max: number, message?: string): FieldValidator<T> {
  return (value) => {
    if (!isPresent(value)) return null;
    return length(value) > max ? (message ?? `Must be at most ${max} characters.`) : null;
  };
}

/** Numeric value must be >= min. */
export function min<T = DynamicFormValues>(minValue: number, message?: string): FieldValidator<T> {
  return (value) => {
    if (typeof value !== 'number') return null;
    return value < minValue ? (message ?? `Must be at least ${minValue}.`) : null;
  };
}

/** Numeric value must be <= max. */
export function max<T = DynamicFormValues>(maxValue: number, message?: string): FieldValidator<T> {
  return (value) => {
    if (typeof value !== 'number') return null;
    return value > maxValue ? (message ?? `Must be at most ${maxValue}.`) : null;
  };
}

/** Value must match a regular expression. Skips empty values. */
export function pattern<T = DynamicFormValues>(regex: RegExp, message = 'Invalid format.'): FieldValidator<T> {
  return (value) => {
    if (!isPresent(value)) return null;
    return typeof value === 'string' && regex.test(value) ? null : message;
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Basic email shape check. Skips empty values — pair with `required` to also enforce presence. */
export function email<T = DynamicFormValues>(message = 'Enter a valid email address.'): FieldValidator<T> {
  return (value) => {
    if (!isPresent(value)) return null;
    return typeof value === 'string' && EMAIL_RE.test(value) ? null : message;
  };
}

/** Value must equal another field's current value (e.g. "confirm password"). */
export function matchesField<T extends DynamicFormValues = DynamicFormValues>(
  otherFieldName: string,
  message = 'Values do not match.',
): FieldValidator<T> {
  return (value, values) => (value === (values as DynamicFormValues)[otherFieldName] ? null : message);
}

/** Runs each validator in order and returns the first error, or null if all pass. */
export function composeValidators<T = DynamicFormValues>(...validators: FieldValidator<T>[]): FieldValidator<T> {
  return (value, values) => {
    for (const validator of validators) {
      const result = validator(value, values);
      if (result) return result;
    }
    return null;
  };
}
