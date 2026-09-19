import { useState } from 'react';
import type {
  ControlSize,
  DynamicFormConfig,
  DynamicFormField,
  DynamicFormSection,
  DynamicFormValues,
  FieldOption,
  FieldType,
  FormMode,
} from '../components/shared/DynamicForm';
import type { StudioFormPreset } from '../data/studioFormConfigs';
import { loadSavedConfig, saveConfig } from '../utils/configStorage';

/**
 * Owns a locally-editable copy of a DynamicForm preset's config, mirroring
 * `useDataTableEditor` — Studio's PropertiesPanel mutates it (sections, fields, and every
 * field-level option that isn't a function) and the canvas re-renders the actual shared
 * DynamicForm with the live result. Resets to the preset's own config (or a previously-saved
 * edit, see `save()`) whenever the preset itself changes, during render rather than an effect
 * (same pattern as the table editor).
 */
export type FormEditorTab = 'form' | 'section' | 'field';

function resolveInitialConfig(
  preset: StudioFormPreset | undefined,
  pageId: string | undefined,
): DynamicFormConfig<DynamicFormValues> | null {
  if (!preset) return null;
  return loadSavedConfig<DynamicFormConfig<DynamicFormValues>>(pageId) ?? preset.config;
}

export function useDynamicFormEditor(preset: StudioFormPreset | undefined, pageId?: string) {
  const [config, setConfig] = useState<DynamicFormConfig<DynamicFormValues> | null>(() =>
    resolveInitialConfig(preset, pageId),
  );
  const [lastPreset, setLastPreset] = useState(preset);
  const [saved, setSaved] = useState(false);

  /** Selection state shared between the canvas (click a section/field to select it) and the
   * properties panel's Form/Section/Field tabs — lifted here so both can read and drive it. */
  const [tab, setTab] = useState<FormEditorTab>('form');
  const [activeSectionKey, setActiveSectionKey] = useState<string | null>(null);
  const [activeFieldName, setActiveFieldName] = useState<string | null>(null);

  if (preset !== lastPreset) {
    setLastPreset(preset);
    setConfig(resolveInitialConfig(preset, pageId));
    setTab('form');
    setActiveSectionKey(null);
    setActiveFieldName(null);
    setSaved(false);
  }

  const save = () => {
    if (!config) return;
    saveConfig(pageId, config);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const selectSection = (sectionKey: string) => {
    setActiveSectionKey(sectionKey);
    setActiveFieldName(null);
    setTab('section');
  };

  const selectField = (sectionKey: string, fieldName: string) => {
    setActiveSectionKey(sectionKey);
    setActiveFieldName(fieldName);
    setTab('field');
  };

  const update = (
    updater: (prev: DynamicFormConfig<DynamicFormValues>) => DynamicFormConfig<DynamicFormValues>,
  ) => {
    setConfig((prev) => (prev ? updater(prev) : prev));
  };

  const setMode = (mode: FormMode) => update((prev) => ({ ...prev, mode }));
  const setColumns = (columns: number) => update((prev) => ({ ...prev, columns }));
  const setSize = (size: ControlSize) => update((prev) => ({ ...prev, size }));
  const setValidateOnChange = (value: boolean) => update((prev) => ({ ...prev, validateOnChange: value }));
  const setShowActions = (value: boolean) => update((prev) => ({ ...prev, showActions: value }));
  const setTitle = (title: string) => update((prev) => ({ ...prev, title: title || undefined }));
  const setSubmitLabel = (label: string) => update((prev) => ({ ...prev, submitLabel: label || undefined }));
  const setCancelLabel = (label: string) => update((prev) => ({ ...prev, cancelLabel: label || undefined }));

  const updateSection = (
    sectionKey: string,
    patch: Partial<
      Pick<DynamicFormSection, 'title' | 'description' | 'collapsible' | 'collapsedByDefault' | 'columns' | 'divider'>
    >,
  ) =>
    update((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.key === sectionKey ? { ...s, ...patch } : s)),
    }));

  const addSection = () =>
    update((prev) => {
      let n = prev.sections.length + 1;
      while (prev.sections.some((s) => s.key === `section-${n}`)) n += 1;
      return {
        ...prev,
        sections: [...prev.sections, { key: `section-${n}`, title: `Section ${n}`, fields: [] }],
      };
    });

  const removeSection = (sectionKey: string) =>
    update((prev) => ({ ...prev, sections: prev.sections.filter((s) => s.key !== sectionKey) }));

  const addField = (sectionKey: string, field: { name: string; label: string; type: FieldType }) =>
    update((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.key === sectionKey && !s.fields.some((f) => f.name === field.name)
          ? { ...s, fields: [...s.fields, field] }
          : s,
      ),
    }));

  const removeField = (sectionKey: string, fieldName: string) =>
    update((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.key === sectionKey ? { ...s, fields: s.fields.filter((f) => f.name !== fieldName) } : s,
      ),
    }));

  /** Field identity (name) is fixed at creation — renaming would break `data` bindings and validation lookups. Everything else non-function stays editable. */
  const updateField = (
    sectionKey: string,
    fieldName: string,
    patch: Partial<
      Pick<
        DynamicFormField,
        | 'label'
        | 'type'
        | 'placeholder'
        | 'required'
        | 'disabled'
        | 'hidden'
        | 'options'
        | 'min'
        | 'max'
        | 'step'
        | 'rows'
        | 'multiple'
        | 'accept'
        | 'colSpan'
        | 'icon'
        | 'helperText'
      >
    >,
  ) =>
    update((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.key === sectionKey
          ? { ...s, fields: s.fields.map((f) => (f.name === fieldName ? { ...f, ...patch } : f)) }
          : s,
      ),
    }));

  return {
    data: preset?.data,
    config,
    save,
    saved,
    tab,
    setTab,
    activeSectionKey,
    activeFieldName,
    selectSection,
    selectField,
    setMode,
    setColumns,
    setSize,
    setValidateOnChange,
    setShowActions,
    setTitle,
    setSubmitLabel,
    setCancelLabel,
    addSection,
    removeSection,
    updateSection,
    addField,
    removeField,
    updateField,
  };
}

export type DynamicFormEditor = ReturnType<typeof useDynamicFormEditor>;
export type { FieldOption };
