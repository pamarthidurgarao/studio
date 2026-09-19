import { useState } from 'react';
import type { StepperFormConfig, StepperOrientation } from '../components/shared/StepperForm';
import type { ControlSize, DynamicFormField, DynamicFormValues, FieldType, FormMode } from '../components/shared/DynamicForm';
import type { StudioStepperPreset } from '../data/studioStepperConfigs';
import { loadSavedConfig, saveConfig } from '../utils/configStorage';

/**
 * Owns a locally-editable copy of a StepperForm preset's config, mirroring `useDynamicFormEditor`.
 * Each step's fields live in its first section (created on demand) — Studio's stepper builder
 * treats a step as a flat field list rather than exposing multi-section nesting per step.
 */
function resolveInitialConfig(
  preset: StudioStepperPreset | undefined,
  pageId: string | undefined,
): StepperFormConfig<DynamicFormValues> | null {
  if (!preset) return null;
  return loadSavedConfig<StepperFormConfig<DynamicFormValues>>(pageId) ?? preset.config;
}

export function useStepperFormEditor(preset: StudioStepperPreset | undefined, pageId?: string) {
  const [config, setConfig] = useState<StepperFormConfig<DynamicFormValues> | null>(() =>
    resolveInitialConfig(preset, pageId),
  );
  const [lastPreset, setLastPreset] = useState(preset);
  const [activeStep, setActiveStep] = useState(0);
  const [saved, setSaved] = useState(false);

  if (preset !== lastPreset) {
    setLastPreset(preset);
    setConfig(resolveInitialConfig(preset, pageId));
    setActiveStep(0);
    setSaved(false);
  }

  const save = () => {
    if (!config) return;
    saveConfig(pageId, config);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const update = (
    updater: (prev: StepperFormConfig<DynamicFormValues>) => StepperFormConfig<DynamicFormValues>,
  ) => {
    setConfig((prev) => (prev ? updater(prev) : prev));
  };

  const setMode = (mode: FormMode) => update((prev) => ({ ...prev, mode }));
  const setOrientation = (orientation: StepperOrientation) => update((prev) => ({ ...prev, orientation }));
  const setLinear = (linear: boolean) => update((prev) => ({ ...prev, linear }));
  const setColumns = (columns: number) => update((prev) => ({ ...prev, columns }));
  const setSize = (size: ControlSize) => update((prev) => ({ ...prev, size }));
  const setValidateOnChange = (value: boolean) => update((prev) => ({ ...prev, validateOnChange: value }));
  const setShowCancel = (value: boolean) => update((prev) => ({ ...prev, showCancel: value }));
  const setNextLabel = (label: string) => update((prev) => ({ ...prev, nextLabel: label || undefined }));
  const setBackLabel = (label: string) => update((prev) => ({ ...prev, backLabel: label || undefined }));
  const setFinishLabel = (label: string) => update((prev) => ({ ...prev, finishLabel: label || undefined }));

  const renameStep = (stepKey: string, label: string) =>
    update((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.key === stepKey ? { ...s, label } : s)),
    }));

  const addStep = () =>
    update((prev) => {
      let n = prev.steps.length + 1;
      while (prev.steps.some((s) => s.key === `step-${n}`)) n += 1;
      return {
        ...prev,
        steps: [
          ...prev.steps,
          { key: `step-${n}`, label: `Step ${n}`, sections: [{ key: 'main', columns: prev.columns ?? 1, fields: [] }] },
        ],
      };
    });

  const removeStep = (stepKey: string) =>
    update((prev) => ({ ...prev, steps: prev.steps.filter((s) => s.key !== stepKey) }));

  const addField = (stepKey: string, field: { name: string; label: string; type: FieldType }) =>
    update((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => {
        if (s.key !== stepKey) return s;
        const sections = s.sections.length ? s.sections : [{ key: 'main', columns: prev.columns ?? 1, fields: [] }];
        return {
          ...s,
          sections: sections.map((sec, i) =>
            i === 0 && !sec.fields.some((f) => f.name === field.name) ? { ...sec, fields: [...sec.fields, field] } : sec,
          ),
        };
      }),
    }));

  const removeField = (stepKey: string, fieldName: string) =>
    update((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.key === stepKey
          ? { ...s, sections: s.sections.map((sec) => ({ ...sec, fields: sec.fields.filter((f) => f.name !== fieldName) })) }
          : s,
      ),
    }));

  const updateField = (
    stepKey: string,
    fieldName: string,
    patch: Partial<
      Pick<
        DynamicFormField,
        'label' | 'type' | 'placeholder' | 'required' | 'disabled' | 'hidden' | 'options' | 'colSpan' | 'helperText'
      >
    >,
  ) =>
    update((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.key === stepKey
          ? {
              ...s,
              sections: s.sections.map((sec) => ({
                ...sec,
                fields: sec.fields.map((f) => (f.name === fieldName ? { ...f, ...patch } : f)),
              })),
            }
          : s,
      ),
    }));

  return {
    data: preset?.data,
    config,
    save,
    saved,
    activeStep,
    setActiveStep,
    setMode,
    setOrientation,
    setLinear,
    setColumns,
    setSize,
    setValidateOnChange,
    setShowCancel,
    setNextLabel,
    setBackLabel,
    setFinishLabel,
    renameStep,
    addStep,
    removeStep,
    addField,
    removeField,
    updateField,
  };
}

export type StepperFormEditor = ReturnType<typeof useStepperFormEditor>;
