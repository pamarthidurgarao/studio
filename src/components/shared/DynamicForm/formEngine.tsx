/**
 * Shared rendering/validation engine behind DynamicForm — extracted so StepperForm (and any
 * future form-shaped component) can reuse the exact same field rendering, option resolution,
 * and validation logic instead of duplicating it. Not part of the public API: import from
 * `./DynamicForm` or `./StepperForm` (in `../StepperForm`), not this file, from outside.
 */
import { useEffect, useRef, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';
import { InputSwitch } from 'primereact/inputswitch';
import { Calendar } from 'primereact/calendar';
import { FileUpload, type FileUploadSelectEvent } from 'primereact/fileupload';
import { Rating } from 'primereact/rating';
import { Slider } from 'primereact/slider';
import { Chips } from 'primereact/chips';
import { Panel } from 'primereact/panel';
import { Message } from 'primereact/message';

import type { ControlSize, DynamicFormField, DynamicFormSection, FieldOption } from './types';

export type PrimeSize = 'small' | 'large' | undefined;

export function toPrimeSize(size: ControlSize): PrimeSize {
  return size === 'medium' ? undefined : size;
}

/** "medium" gets its own `-md` marker (not a real PrimeReact class) because the app-wide
 * default-size override coopts the theme's unsuffixed base rule to mean "small" — without
 * this marker, explicitly requesting "medium" would render identical to "small". */
export function toInputSizeClass(size: ControlSize): string {
  if (size === 'small') return 'p-inputtext-sm';
  if (size === 'large') return 'p-inputtext-lg';
  return 'p-inputtext-md';
}

export function getValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

export function setValueImmutable<T extends object>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const [head, ...rest] = keys;
  if (rest.length === 0) {
    return { ...obj, [head]: value };
  }
  const nested = (obj as Record<string, unknown>)[head];
  const nestedObj = nested && typeof nested === 'object' ? (nested as object) : {};
  return { ...obj, [head]: setValueImmutable(nestedObj, rest.join('.'), value) };
}

export function resolveBool<T>(input: boolean | ((values: T) => boolean) | undefined, values: T): boolean {
  if (typeof input === 'function') return input(values);
  return input ?? false;
}

export function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export interface FieldOptionsState {
  options: FieldOption[];
  loading: boolean;
}

/** Resolves each field's options (static, derived, or async) and re-resolves when its `dependsOn` values change. */
export function useResolvedOptions<T extends object>(
  fields: DynamicFormField<T>[],
  values: T,
): Record<string, FieldOptionsState> {
  const [state, setState] = useState<Record<string, FieldOptionsState>>({});
  const prevDepsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    fields.forEach((field) => {
      if (!field.options) return;
      if (typeof field.options !== 'function') {
        setState((prev) =>
          prev[field.name]?.options === field.options
            ? prev
            : { ...prev, [field.name]: { options: field.options as FieldOption[], loading: false } },
        );
        return;
      }

      const depValues = (field.dependsOn ?? []).map((dep) => getValue(values, dep));
      const depSignature = JSON.stringify(depValues);
      const alreadyResolved = field.name in prevDepsRef.current;
      if (alreadyResolved && prevDepsRef.current[field.name] === depSignature) return;
      prevDepsRef.current[field.name] = depSignature;

      const resolver = field.options;
      setState((prev) => ({ ...prev, [field.name]: { options: prev[field.name]?.options ?? [], loading: true } }));
      Promise.resolve(resolver(values)).then((options) => {
        setState((prev) => ({ ...prev, [field.name]: { options, loading: false } }));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, values]);

  return state;
}

export function fieldError<T extends object>(
  field: DynamicFormField<T>,
  value: unknown,
  values: T,
): string | undefined {
  if (resolveBool(field.required, values) && isEmpty(value)) return `${field.label} is required.`;

  for (const validator of field.validators ?? []) {
    const message = validator(value, values);
    if (message) return message;
  }

  const customError = field.validate?.(value, values);
  return customError ?? undefined;
}

/** Validates every visible field across every visible section. Used for "validate this whole group" (a form, or one stepper step / the full stepper). */
export function validateSections<T extends object>(
  sections: DynamicFormSection<T>[],
  values: T,
): Record<string, string> {
  const errors: Record<string, string> = {};
  sections.forEach((section) => {
    if (resolveBool(section.hidden, values)) return;
    section.fields.forEach((field) => {
      if (resolveBool(field.hidden, values)) return;
      const value = getValue(values, field.name);
      const message = fieldError(field, value, values);
      if (message) errors[field.name] = message;
    });
  });
  return errors;
}

export function ViewValue<T extends object>({
  field,
  value,
  values,
  options,
}: {
  field: DynamicFormField<T>;
  value: unknown;
  values: T;
  options: FieldOption[];
}) {
  if (field.formatView) return <>{field.formatView(value, values)}</>;
  if (isEmpty(value)) return <span className="df-view-empty">—</span>;

  if (field.type === 'checkbox' || field.type === 'switch') return <>{value ? 'Yes' : 'No'}</>;

  if (field.type === 'dropdown' || field.type === 'radio') {
    const match = options.find((o) => o.value === value);
    return <>{match?.label ?? String(value)}</>;
  }

  if (field.type === 'multiselect' && Array.isArray(value)) {
    const labels = value.map((v) => options.find((o) => o.value === v)?.label ?? String(v));
    return <>{labels.join(', ')}</>;
  }

  if (field.type === 'chips' && Array.isArray(value)) {
    return <>{(value as string[]).join(', ')}</>;
  }

  if (field.type === 'date' && value) {
    const date = value instanceof Date ? value : new Date(value as string);
    return <>{Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()}</>;
  }

  if (field.type === 'file') {
    const files = value as File[] | undefined;
    return <>{files && files.length > 0 ? files.map((f) => f.name).join(', ') : '—'}</>;
  }

  return <>{String(value)}</>;
}

interface FieldControlProps<T extends object> {
  field: DynamicFormField<T>;
  value: unknown;
  values: T;
  setValue: (value: unknown) => void;
  disabled: boolean;
  size: PrimeSize;
  sizeClass: string;
  options: FieldOption[];
  optionsLoading: boolean;
  onFileSelect: (files: File[]) => void;
}

export function FieldControl<T extends object>({
  field,
  value,
  values,
  setValue,
  disabled,
  size,
  sizeClass,
  options,
  optionsLoading,
  onFileSelect,
}: FieldControlProps<T>) {
  switch (field.type) {
    case 'text':
    case 'email':
      return (
        <InputText
          value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
          onChange={(e) => setValue(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          className={sizeClass || undefined}
          type={field.type === 'email' ? 'email' : 'text'}
        />
      );
    case 'textarea':
      return (
        <InputTextarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => setValue(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          rows={field.rows ?? 3}
          className={sizeClass || undefined}
        />
      );
    case 'number':
      return (
        <InputNumber
          value={typeof value === 'number' ? value : null}
          onValueChange={(e) => setValue(e.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          min={field.min}
          max={field.max}
          step={field.step}
          inputClassName={sizeClass || undefined}
        />
      );
    case 'password':
      return (
        <Password
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => setValue(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          feedback={false}
          toggleMask
          inputClassName={sizeClass || undefined}
        />
      );
    case 'dropdown':
      return (
        <Dropdown
          value={value ?? null}
          options={options}
          onChange={(e) => setValue(e.value)}
          placeholder={field.placeholder ?? optionsLoading ? 'Loading...' : 'Select...'}
          disabled={disabled || optionsLoading}
          showClear
          className={sizeClass || undefined}
          panelClassName={sizeClass || undefined}
        />
      );
    case 'multiselect':
      return (
        <MultiSelect
          value={Array.isArray(value) ? value : []}
          options={options}
          onChange={(e) => setValue(e.value)}
          placeholder={field.placeholder ?? (optionsLoading ? 'Loading...' : 'Select...')}
          disabled={disabled || optionsLoading}
          className={sizeClass || undefined}
          panelClassName={sizeClass || undefined}
        />
      );
    case 'radio':
      return (
        <div className="df-radio-group">
          {options.map((opt) => (
            <label key={String(opt.value)} className="df-radio-option">
              <RadioButton
                name={field.name}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => setValue(e.value)}
                disabled={disabled}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <Checkbox
          checked={Boolean(value)}
          onChange={(e) => setValue(Boolean(e.checked))}
          disabled={disabled}
        />
      );
    case 'switch':
      return (
        <InputSwitch
          checked={Boolean(value)}
          onChange={(e) => setValue(Boolean(e.value))}
          disabled={disabled}
          className={sizeClass || undefined}
        />
      );
    case 'date':
      return (
        <Calendar
          value={value ? new Date(value as string | number | Date) : null}
          onChange={(e) => setValue(e.value ?? null)}
          placeholder={field.placeholder}
          disabled={disabled}
          showIcon
          dateFormat="yy-mm-dd"
          className={sizeClass || undefined}
          inputClassName={sizeClass || undefined}
          panelClassName={sizeClass || undefined}
        />
      );
    case 'file':
      return (
        <FileUpload
          mode="basic"
          auto={false}
          multiple={field.multiple}
          accept={field.accept}
          maxFileSize={field.maxFileSizeMb ? field.maxFileSizeMb * 1024 * 1024 : undefined}
          disabled={disabled}
          chooseLabel={field.placeholder ?? 'Choose file'}
          onSelect={(e: FileUploadSelectEvent) => {
            const files = Array.from(e.files);
            setValue(field.multiple ? files : files[0]);
            onFileSelect(files);
          }}
        />
      );
    case 'rating':
      return (
        <Rating
          value={typeof value === 'number' ? value : 0}
          onChange={(e) => setValue(e.value ?? 0)}
          disabled={disabled}
        />
      );
    case 'slider':
      return (
        <div className="df-slider-wrap">
          <Slider
            value={typeof value === 'number' ? value : field.min ?? 0}
            onChange={(e) => setValue(e.value)}
            min={field.min}
            max={field.max}
            step={field.step}
            disabled={disabled}
          />
          <span className="df-slider-value">{typeof value === 'number' ? value : field.min ?? 0}</span>
        </div>
      );
    case 'chips':
      return (
        <Chips
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={(e) => setValue(e.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          className={sizeClass || undefined}
        />
      );
    case 'custom':
      return <>{field.render?.({ value, values, setValue, disabled, size: (size ?? 'medium') as ControlSize })}</>;
    default:
      return null;
  }
}

export interface FormSectionProps<T extends object> {
  section: DynamicFormSection<T>;
  values: T;
  errors: Record<string, string>;
  optionsState: Record<string, FieldOptionsState>;
  isViewMode: boolean;
  columns: number;
  primeSize: PrimeSize;
  sizeClass: string;
  collapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  setFieldValue: (field: DynamicFormField<T>, value: unknown) => void;
  onFileSelect: (field: DynamicFormField<T>, files: File[]) => void;
}

/** Renders one section: optional collapsible Panel chrome + a responsive grid of its fields. Shared by DynamicForm and StepperForm so both stay visually and behaviorally identical. */
export function FormSection<T extends object>({
  section,
  values,
  errors,
  optionsState,
  isViewMode,
  columns,
  primeSize,
  sizeClass,
  collapsed,
  onToggleCollapse,
  setFieldValue,
  onFileSelect,
}: FormSectionProps<T>) {
  if (resolveBool(section.hidden, values)) return null;
  const sectionColumns = section.columns ?? columns;
  const isCollapsed = section.collapsible && collapsed;

  const body = (
    <div className="df-section-grid" style={{ gridTemplateColumns: `repeat(${sectionColumns}, 1fr)` }}>
      {section.fields.map((field) => {
        if (resolveBool(field.hidden, values)) return null;
        const value = getValue(values, field.name);
        const disabled = isViewMode || resolveBool(field.disabled, values);
        const error = errors[field.name];
        const resolved = optionsState[field.name];

        return (
          <div
            key={field.name}
            className="df-field"
            data-df-field={field.name}
            style={{ gridColumn: field.colSpan === 'full' ? '1 / -1' : `span ${field.colSpan ?? 1}` }}
          >
            <label className="df-field-label">
              {field.icon && <i className={field.icon} />}
              {field.label}
              {resolveBool(field.required, values) && !isViewMode && <span className="df-required">*</span>}
            </label>

            {isViewMode ? (
              <div className="df-view-value">
                <ViewValue field={field} value={value} values={values} options={resolved?.options ?? []} />
              </div>
            ) : (
              <>
                <FieldControl
                  field={field}
                  value={value}
                  values={values}
                  setValue={(v) => setFieldValue(field, v)}
                  disabled={disabled}
                  size={primeSize}
                  sizeClass={sizeClass}
                  options={resolved?.options ?? []}
                  optionsLoading={resolved?.loading ?? false}
                  onFileSelect={(files) => onFileSelect(field, files)}
                />
                {field.helperText && !error && <small className="df-helper-text">{field.helperText}</small>}
                {error && <Message severity="error" text={error} className="df-field-error" />}
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  if (!section.title && !section.collapsible) {
    return (
      <div className="df-section-plain" data-df-section={section.key}>
        {section.divider && <hr className="df-section-divider" />}
        {body}
      </div>
    );
  }

  return (
    <Panel
      header={section.title}
      toggleable={section.collapsible}
      collapsed={isCollapsed}
      onToggle={(e) => onToggleCollapse(e.value)}
      className="df-section-panel"
      data-df-section={section.key}
    >
      {section.description && <p className="df-section-description">{section.description}</p>}
      {section.divider && <hr className="df-section-divider" />}
      {body}
    </Panel>
  );
}
