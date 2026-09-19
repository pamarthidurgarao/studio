import type { ReactNode } from 'react';

export type ControlSize = 'small' | 'medium' | 'large';

export type FormMode = 'add' | 'edit' | 'view';

export type DynamicFormValues = Record<string, unknown>;

export type FieldOption = { label: string; value: string | number | boolean };

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'password'
  | 'email'
  | 'dropdown'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'file'
  | 'rating'
  | 'slider'
  | 'chips'
  | 'custom';

/** Static list, a list derived from the current form values, or an async lookup (e.g. dependent dropdowns). */
export type FieldOptionsSource<T = DynamicFormValues> =
  | FieldOption[]
  | ((values: T) => FieldOption[] | Promise<FieldOption[]>);

/** A composable validation rule — see `validators.ts` for ready-made ones (minLength, maxLength, min, max, pattern, email, ...). */
export type FieldValidator<T = DynamicFormValues> = (value: unknown, values: T) => string | null | undefined;

export interface DynamicFormField<T = DynamicFormValues> {
  /** Key into the form values object. Supports dot paths, e.g. "address.city". */
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: unknown;

  /** Static or computed from the current form values. */
  required?: boolean | ((values: T) => boolean);
  /** Static or computed from the current form values. */
  disabled?: boolean | ((values: T) => boolean);
  /** Static or computed from the current form values. Hidden fields are excluded from validation. */
  hidden?: boolean | ((values: T) => boolean);

  /** dropdown / multiselect / radio options. Can be static, derived, or async. */
  options?: FieldOptionsSource<T>;
  /** Field names this field's `options` depends on — re-resolves options when any of them change. */
  dependsOn?: string[];

  /** Custom one-off validator. Return an error message, or undefined/null if valid. Runs after `validators`. */
  validate?: FieldValidator<T>;
  /** Composable rules from `validators.ts` (or your own). Run in order after `required`; the first error wins. */
  validators?: FieldValidator<T>[];

  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  multiple?: boolean;
  accept?: string;
  maxFileSizeMb?: number;

  /** Grid width in the section's column track. Defaults to 1. "full" spans every column. */
  colSpan?: number | 'full';
  icon?: string;
  helperText?: string;
  /** How to render the value in "view" mode. Defaults to String(value), or the matching option's label. */
  formatView?: (value: unknown, values: T) => ReactNode;
  /** Only used when type === "custom". Renders the field's edit control. */
  render?: (ctx: {
    value: unknown;
    values: T;
    setValue: (value: unknown) => void;
    disabled: boolean;
    size: ControlSize;
  }) => ReactNode;
}

export interface DynamicFormSection<T = DynamicFormValues> {
  key: string;
  title?: string;
  description?: string;
  collapsible?: boolean;
  collapsedByDefault?: boolean;
  /** Number of grid columns fields lay out into. Defaults to config.columns or 1. */
  columns?: number;
  /** Renders a divider line between the section header and its fields. */
  divider?: boolean;
  hidden?: boolean | ((values: T) => boolean);
  fields: DynamicFormField<T>[];
}

export interface DynamicFormConfig<T = DynamicFormValues> {
  sections: DynamicFormSection<T>[];
  mode: FormMode;

  /** Default grid columns for sections that don't specify their own. Defaults to 1. */
  columns?: number;
  size?: ControlSize;

  showActions?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  /** Disables the submit button until all required/validated fields pass. Defaults to false (validate on submit). */
  validateOnChange?: boolean;

  title?: string;
  loading?: boolean;
}

/** Every interaction the form can produce, delivered through the single `onAction` callback. */
export type DynamicFormActionEvent<T = DynamicFormValues> =
  | { type: 'field-change'; name: string; value: unknown; values: T }
  | { type: 'submit'; values: T; isValid: boolean; errors: Record<string, string> }
  | { type: 'cancel' }
  | { type: 'file-select'; name: string; files: File[]; values: T };

export interface DynamicFormProps<T = DynamicFormValues> {
  data: T;
  config: DynamicFormConfig<T>;
  onAction: (event: DynamicFormActionEvent<T>) => void;
}
