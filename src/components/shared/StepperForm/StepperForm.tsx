import { useMemo, useState } from 'react';
import { Button } from 'primereact/button';

import {
  FormSection,
  getValue,
  resolveBool,
  setValueImmutable,
  toInputSizeClass,
  toPrimeSize,
  useResolvedOptions,
  validateSections,
  fieldError,
} from '../DynamicForm/formEngine';
import type { DynamicFormField } from '../DynamicForm/types';
import type { StepperFormProps, StepperFormStep } from './types';

export function StepperForm<T extends object>({ data, config, onAction }: StepperFormProps<T>) {
  const {
    steps,
    mode,
    orientation = 'horizontal',
    linear = true,
    columns = 1,
    size = 'medium',
    nextLabel = 'Next',
    backLabel = 'Back',
    finishLabel = mode === 'add' ? 'Create' : 'Save',
    cancelLabel = 'Cancel',
    showCancel = true,
    validateOnChange = false,
    title,
    loading = false,
  } = config;

  const isViewMode = mode === 'view';
  const primeSize = toPrimeSize(size);
  const sizeClass = toInputSizeClass(size);

  const allFields = useMemo(() => steps.flatMap((s) => s.sections.flatMap((sec) => sec.fields)), [steps]);

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
    Object.fromEntries(steps.flatMap((s) => s.sections.map((sec) => [sec.key, Boolean(sec.collapsedByDefault)]))),
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [visitedMax, setVisitedMax] = useState(0);

  const optionsState = useResolvedOptions(allFields, values);

  const visibleSteps = useMemo(
    () => steps.filter((step) => !resolveBool(step.hidden, values)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [steps, values],
  );
  const safeIndex = Math.min(activeIndex, Math.max(visibleSteps.length - 1, 0));
  const currentStep: StepperFormStep<T> | undefined = visibleSteps[safeIndex];
  const isLastStep = safeIndex === visibleSteps.length - 1;

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

  const goToIndex = (nextIndex: number) => {
    if (nextIndex === safeIndex) return;
    onAction({ type: 'step-change', fromIndex: safeIndex, toIndex: nextIndex, values });
    setActiveIndex(nextIndex);
  };

  const handleStepClick = (index: number) => {
    if (isViewMode) return goToIndex(index);
    if (!linear || index <= visitedMax) goToIndex(index);
  };

  const handleBack = () => {
    if (safeIndex > 0) goToIndex(safeIndex - 1);
  };

  const handleNext = () => {
    if (!currentStep) return;
    const stepErrors = validateSections(currentStep.sections, values);
    setErrors((prev) => {
      const withoutCurrentStepFields = { ...prev };
      currentStep.sections.flatMap((s) => s.fields).forEach((f) => delete withoutCurrentStepFields[f.name]);
      return { ...withoutCurrentStepFields, ...stepErrors };
    });
    if (Object.keys(stepErrors).length > 0) return;

    setVisitedMax((prev) => Math.max(prev, safeIndex + 1));
    goToIndex(safeIndex + 1);
  };

  const handleFinish = () => {
    const allSections = visibleSteps.flatMap((s) => s.sections);
    const allErrors = validateSections(allSections, values);
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      const erroredStepIndex = visibleSteps.findIndex((step) =>
        step.sections.some((sec) => sec.fields.some((f) => allErrors[f.name])),
      );
      if (erroredStepIndex >= 0) setActiveIndex(erroredStepIndex);
      onAction({ type: 'submit', values, isValid: false, errors: allErrors });
      return;
    }

    onAction({ type: 'submit', values, isValid: true, errors: {} });
  };

  const handleCancel = () => onAction({ type: 'cancel' });

  return (
    <div className={`sf-stepper sf-${orientation} sf-mode-${mode}`}>
      {title && <h3 className="sf-title">{title}</h3>}

      <div className="sf-layout">
        <div className="sf-steps-nav" role="tablist">
          {visibleSteps.map((step, index) => {
            const status = index < safeIndex ? 'done' : index === safeIndex ? 'current' : 'upcoming';
            const clickable = isViewMode || !linear || index <= visitedMax;
            return (
              <div key={step.key} className={`sf-step sf-step-${status}`}>
                <button
                  type="button"
                  className="sf-step-indicator-btn"
                  disabled={!clickable}
                  onClick={() => handleStepClick(index)}
                  role="tab"
                  aria-selected={index === safeIndex}
                >
                  <span className="sf-step-indicator">
                    {status === 'done' ? <i className="pi pi-check" /> : step.icon ? <i className={step.icon} /> : index + 1}
                  </span>
                  <span className="sf-step-text">
                    <span className="sf-step-label">{step.label}</span>
                    {step.description && <span className="sf-step-description">{step.description}</span>}
                  </span>
                </button>
                {index < visibleSteps.length - 1 && <span className="sf-step-connector" />}
              </div>
            );
          })}
        </div>

        <div className="sf-content">
          {currentStep?.sections.map((section) => (
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

          {!isViewMode && (
            <div className="sf-actions">
              <div className="sf-actions-left">
                {showCancel && (
                  <Button label={cancelLabel} text size={primeSize} className={sizeClass} onClick={handleCancel} disabled={loading} />
                )}
              </div>
              <div className="sf-actions-right">
                {safeIndex > 0 && (
                  <Button label={backLabel} outlined size={primeSize} className={sizeClass} onClick={handleBack} disabled={loading} />
                )}
                {isLastStep ? (
                  <Button label={finishLabel} size={primeSize} className={sizeClass} onClick={handleFinish} loading={loading} />
                ) : (
                  <Button label={nextLabel} size={primeSize} className={sizeClass} onClick={handleNext} disabled={loading} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
