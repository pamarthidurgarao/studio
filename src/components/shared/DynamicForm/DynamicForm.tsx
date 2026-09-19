import { useMemo, useState } from 'react';
import { Button } from 'primereact/button';

import type { DynamicFormField, DynamicFormProps } from './types';
import {
  FormSection,
  getValue,
  setValueImmutable,
  toInputSizeClass,
  toPrimeSize,
  useResolvedOptions,
  validateSections,
  fieldError,
} from './formEngine';

export function DynamicForm<T extends object>({ data, config, onAction }: DynamicFormProps<T>) {
  const {
    sections,
    mode,
    columns = 1,
    size = 'medium',
    showActions = mode !== 'view',
    submitLabel = mode === 'add' ? 'Create' : 'Save',
    cancelLabel = 'Cancel',
    validateOnChange = false,
    title,
    loading = false,
  } = config;

  const isViewMode = mode === 'view';
  const primeSize = toPrimeSize(size);
  const sizeClass = toInputSizeClass(size);

  const allFields = useMemo(() => sections.flatMap((s) => s.fields), [sections]);

  const [values, setValues] = useState<T>(() => {
    let initial = data;
    allFields.forEach((field) => {
      if (getValue(initial, field.name) === undefined && field.defaultValue !== undefined) {
        initial = setValueImmutable(initial, field.name, field.defaultValue);
      }
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.key, Boolean(s.collapsedByDefault)])),
  );

  const optionsState = useResolvedOptions(allFields, values);

  const setFieldValue = (field: DynamicFormField<T>, value: unknown) => {
    const next = setValueImmutable(values, field.name, value);
    setValues(next);
    onAction({ type: 'field-change', name: field.name, value, values: next });
    if (validateOnChange) {
      const message = fieldError(field, value, next);
      setErrors((prev) => {
        const copy = { ...prev };
        if (message) copy[field.name] = message;
        else delete copy[field.name];
        return copy;
      });
    }
  };

  const handleSubmit = () => {
    const nextErrors = validateSections(sections, values);
    setErrors(nextErrors);
    onAction({ type: 'submit', values, isValid: Object.keys(nextErrors).length === 0, errors: nextErrors });
  };

  const handleCancel = () => onAction({ type: 'cancel' });

  return (
    <div className={`df-form df-mode-${mode}`}>
      {title && <h3 className="df-title">{title}</h3>}
      <div className="df-sections">
        {sections.map((section) => (
          <FormSection
            key={section.key}
            section={section}
            values={values}
            errors={errors}
            optionsState={optionsState}
            isViewMode={isViewMode}
            columns={columns}
            primeSize={primeSize}
            sizeClass={sizeClass}
            collapsed={Boolean(collapsed[section.key])}
            onToggleCollapse={(value) => setCollapsed((prev) => ({ ...prev, [section.key]: value }))}
            setFieldValue={setFieldValue}
            onFileSelect={(field, files) => onAction({ type: 'file-select', name: field.name, files, values })}
          />
        ))}
      </div>

      {showActions && (
        <div className="df-actions" data-df-actions="">
          <Button label={cancelLabel} outlined size={primeSize} className={sizeClass} onClick={handleCancel} disabled={loading} />
          <Button label={submitLabel} size={primeSize} className={sizeClass} onClick={handleSubmit} loading={loading} />
        </div>
      )}
    </div>
  );
}
