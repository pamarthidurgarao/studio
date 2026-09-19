import type { ControlSize, DynamicFormSection, DynamicFormValues, FormMode } from '../DynamicForm/types';

export type StepperOrientation = 'horizontal' | 'vertical';

export interface StepperFormStep<T = DynamicFormValues> {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  sections: DynamicFormSection<T>[];
  /** Static or computed from the current form values. Hidden steps are skipped entirely (nav + validation). */
  hidden?: boolean | ((values: T) => boolean);
}

export interface StepperFormConfig<T = DynamicFormValues> {
  steps: StepperFormStep<T>[];
  mode: FormMode;
  /** Defaults to "horizontal". */
  orientation?: StepperOrientation;
  /** When true (default), a step must pass validation before advancing, and the step header
   * only lets you click back to an already-visited step (or forward-jump when false). */
  linear?: boolean;

  /** Default grid columns for sections that don't specify their own. Defaults to 1. */
  columns?: number;
  size?: ControlSize;

  nextLabel?: string;
  backLabel?: string;
  finishLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  /** Disables the submit button until all required/validated fields pass. Defaults to false (validate on submit/next). */
  validateOnChange?: boolean;

  title?: string;
  loading?: boolean;
}

/** Every interaction the stepper can produce, delivered through the single `onAction` callback. */
export type StepperFormActionEvent<T = DynamicFormValues> =
  | { type: 'field-change'; name: string; value: unknown; values: T }
  | { type: 'step-change'; fromIndex: number; toIndex: number; values: T }
  | { type: 'submit'; values: T; isValid: boolean; errors: Record<string, string> }
  | { type: 'cancel' }
  | { type: 'file-select'; name: string; files: File[]; values: T };

export interface StepperFormProps<T = DynamicFormValues> {
  data: T;
  config: StepperFormConfig<T>;
  onAction: (event: StepperFormActionEvent<T>) => void;
}
