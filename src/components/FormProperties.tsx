import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import type { DynamicFormEditor } from '../hooks/useDynamicFormEditor';
import type { ControlSize, DynamicFormField, DynamicFormSection, FieldType, FormMode } from './shared/DynamicForm';
import { chip, fieldGrid, fieldLabel, gapRow, inputClass, layerBadge, layerLabel, presetBtn, sectionLabel } from '../styles/cn';

const FORM_MODE_OPTIONS: { label: string; value: FormMode }[] = [
  { label: 'Add', value: 'add' },
  { label: 'Edit', value: 'edit' },
  { label: 'View', value: 'view' },
];

const FORM_SIZE_OPTIONS: { label: string; value: ControlSize }[] = [
  { label: 'S', value: 'small' },
  { label: 'M', value: 'medium' },
  { label: 'L', value: 'large' },
];

const FIELD_TYPES: { label: string; value: FieldType; icon: string }[] = [
  { label: 'Text', value: 'text', icon: 'pi pi-align-left' },
  { label: 'Textarea', value: 'textarea', icon: 'pi pi-align-justify' },
  { label: 'Number', value: 'number', icon: 'pi pi-hashtag' },
  { label: 'Password', value: 'password', icon: 'pi pi-lock' },
  { label: 'Email', value: 'email', icon: 'pi pi-envelope' },
  { label: 'Dropdown', value: 'dropdown', icon: 'pi pi-chevron-circle-down' },
  { label: 'Multiselect', value: 'multiselect', icon: 'pi pi-list' },
  { label: 'Checkbox', value: 'checkbox', icon: 'pi pi-check-square' },
  { label: 'Radio', value: 'radio', icon: 'pi pi-circle' },
  { label: 'Switch', value: 'switch', icon: 'pi pi-sliders-h' },
  { label: 'Date', value: 'date', icon: 'pi pi-calendar' },
  { label: 'File', value: 'file', icon: 'pi pi-upload' },
  { label: 'Rating', value: 'rating', icon: 'pi pi-star' },
  { label: 'Slider', value: 'slider', icon: 'pi pi-arrows-h' },
  { label: 'Chips', value: 'chips', icon: 'pi pi-tags' },
];

const OPTION_TYPES: FieldType[] = ['dropdown', 'multiselect', 'radio'];
const COL_SPAN_OPTIONS: { label: string; value: number | 'full' }[] = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: 'Full', value: 'full' },
];
const SECTION_COLUMNS_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: 'Inherit', value: undefined },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
];

function slugify(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'field'
  );
}

function parseOptions(text: string): { label: string; value: string }[] {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [label, value] = part.split(':').map((s) => s.trim());
      return { label, value: value || label };
    });
}

function formatOptions(options: { label: string; value: string | number | boolean }[] | undefined): string {
  return (options ?? []).map((o) => (o.label === String(o.value) ? o.label : `${o.label}:${o.value}`)).join(', ');
}

/** A small labeled row of mutually-exclusive pill buttons — used for column/span/mode pickers throughout this panel. */
function SegmentedControl<V extends string | number | undefined>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: V }[];
  value: V;
  onChange: (value: V) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[3px]">
      {options.map((opt) => (
        <button key={String(opt.value)} type="button" className={presetBtn(value === opt.value)} onClick={() => onChange(opt.value)}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Breadcrumb({ parts }: { parts: string[] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap text-[10.5px]">
      {parts.map((part, i) => (
        <span key={i} className="contents">
          {i > 0 && <span className="text-[var(--color-neutral-600)]">›</span>}
          <span className={i === parts.length - 1 ? undefined : 'text-[var(--color-neutral-400)]'}>{part}</span>
        </span>
      ))}
    </div>
  );
}

type Tab = 'form' | 'section' | 'field';

interface FormPropertiesProps {
  formEditor: DynamicFormEditor;
}

export function FormProperties({ formEditor }: FormPropertiesProps) {
  const { config, tab, setTab, activeSectionKey, activeFieldName, selectSection, selectField } = formEditor;
  const [addingFieldTo, setAddingFieldTo] = useState<string | null>(null);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');

  if (!config) return null;

  const activeSection: DynamicFormSection | undefined =
    config.sections.find((s) => s.key === activeSectionKey) ?? config.sections[0];
  const activeField: DynamicFormField | undefined = activeSection?.fields.find((f) => f.name === activeFieldName);

  const openSection = selectSection;
  const openField = selectField;

  const handleAddField = (sectionKey: string) => {
    const label = newFieldLabel.trim();
    if (!label) return;
    formEditor.addField(sectionKey, { name: slugify(label), label, type: newFieldType });
    setNewFieldLabel('');
    setNewFieldType('text');
    setAddingFieldTo(null);
  };

  const addSectionAndOpen = () => {
    const nextIndex = config.sections.length + 1;
    formEditor.addSection();
    openSection(`section-${nextIndex}`);
  };

  return (
    <div className="flex-1 overflow-auto p-3 flex flex-col gap-3.5">
      <div className="flex gap-0.5 rounded-md border border-[var(--color-divider)] p-0.5">
        {(
          [
            ['form', 'Form'],
            ['section', 'Section'],
            ['field', 'Field'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`${chip(tab === key)} !flex-1 min-w-0 justify-center disabled:opacity-40 disabled:cursor-not-allowed`}
            disabled={key !== 'form' && !activeSection}
            onClick={() => setTab(key)}
          >
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {tab === 'form' && (
        <>
          <Breadcrumb parts={[config.title || 'Form']} />

          <div className="flex flex-col gap-1.5">
            <div className={sectionLabel}>Identity</div>
            <div>
              <label className={fieldLabel}>Title</label>
              <InputText className={`${inputClass} w-full`} value={config.title ?? ''} onChange={(e) => formEditor.setTitle(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className={sectionLabel}>Layout</div>
            <div>
              <label className={fieldLabel}>Mode</label>
              <SegmentedControl options={FORM_MODE_OPTIONS} value={config.mode} onChange={formEditor.setMode} />
            </div>
            <div>
              <label className={fieldLabel}>Size</label>
              <SegmentedControl options={FORM_SIZE_OPTIONS} value={config.size ?? 'medium'} onChange={formEditor.setSize} />
            </div>
            <div>
              <label className={fieldLabel}>Default columns</label>
              <SegmentedControl
                options={[1, 2, 3].map((n) => ({ label: String(n), value: n }))}
                value={config.columns ?? 1}
                onChange={formEditor.setColumns}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className={sectionLabel}>Behavior</div>
            <div className={gapRow}>
              <span className="text-[11.5px] text-[var(--color-neutral-400)]">Validate on change</span>
              <InputSwitch checked={Boolean(config.validateOnChange)} onChange={(e) => formEditor.setValidateOnChange(Boolean(e.value))} />
            </div>
            <div className={gapRow}>
              <span className="text-[11.5px] text-[var(--color-neutral-400)]">Show actions</span>
              <InputSwitch checked={config.showActions ?? config.mode !== 'view'} onChange={(e) => formEditor.setShowActions(Boolean(e.value))} />
            </div>
            <div className={fieldGrid}>
              <div>
                <label className={fieldLabel}>Submit label</label>
                <InputText className={`${inputClass} w-full`} value={config.submitLabel ?? ''} onChange={(e) => formEditor.setSubmitLabel(e.target.value)} />
              </div>
              <div>
                <label className={fieldLabel}>Cancel label</label>
                <InputText className={`${inputClass} w-full`} value={config.cancelLabel ?? ''} onChange={(e) => formEditor.setCancelLabel(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className={sectionLabel}>Sections</div>
              <Button icon="pi pi-plus" text size="small" className="!w-[22px] !h-[22px]" onClick={addSectionAndOpen} />
            </div>
            {config.sections.map((section) => (
              <button
                key={section.key}
                type="button"
                className="flex items-center gap-[7px] w-full rounded-md border border-transparent px-2 py-1.5 cursor-pointer text-left text-[12px] bg-transparent text-[var(--color-neutral-300)] hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]"
                onClick={() => openSection(section.key)}
              >
                <i className="pi pi-th-large" style={{ fontSize: 13, opacity: 0.7 }} />
                <span className={layerLabel}>{section.title ?? section.key}</span>
                <span className={layerBadge}>{section.fields.length}</span>
                <i className="pi pi-chevron-right" style={{ fontSize: 10, opacity: 0.6 }} />
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'section' && activeSection && (
        <>
          <Breadcrumb parts={[config.title || 'Form', activeSection.title ?? activeSection.key]} />

          <div className="flex flex-col gap-1.5">
            <div className={sectionLabel}>Section</div>
            <div>
              <label className={fieldLabel}>Title</label>
              <InputText
                className={`${inputClass} w-full`}
                value={activeSection.title ?? ''}
                onChange={(e) => formEditor.updateSection(activeSection.key, { title: e.target.value })}
              />
            </div>
            <div>
              <label className={fieldLabel}>Description</label>
              <InputText
                className={`${inputClass} w-full`}
                placeholder="Optional helper line"
                value={activeSection.description ?? ''}
                onChange={(e) => formEditor.updateSection(activeSection.key, { description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className={sectionLabel}>Layout</div>
            <div>
              <label className={fieldLabel}>Columns</label>
              <SegmentedControl
                options={SECTION_COLUMNS_OPTIONS}
                value={activeSection.columns}
                onChange={(v) => formEditor.updateSection(activeSection.key, { columns: v })}
              />
            </div>
            <div className={gapRow}>
              <span className="text-[11.5px] text-[var(--color-neutral-400)]">Collapsible</span>
              <InputSwitch
                checked={Boolean(activeSection.collapsible)}
                onChange={(e) => formEditor.updateSection(activeSection.key, { collapsible: Boolean(e.value) })}
              />
            </div>
            {activeSection.collapsible && (
              <div className={gapRow}>
                <span className="text-[11.5px] text-[var(--color-neutral-400)]">Collapsed by default</span>
                <InputSwitch
                  checked={Boolean(activeSection.collapsedByDefault)}
                  onChange={(e) => formEditor.updateSection(activeSection.key, { collapsedByDefault: Boolean(e.value) })}
                />
              </div>
            )}
            <div className={gapRow}>
              <span className="text-[11.5px] text-[var(--color-neutral-400)]">Show divider</span>
              <InputSwitch
                checked={Boolean(activeSection.divider)}
                onChange={(e) => formEditor.updateSection(activeSection.key, { divider: Boolean(e.value) })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className={sectionLabel}>Fields in section</div>
            {activeSection.fields.map((field) => (
              <button
                key={field.name}
                type="button"
                className="flex items-center gap-[7px] w-full rounded-md border border-transparent px-2 py-1.5 cursor-pointer text-left text-[12px] bg-transparent text-[var(--color-neutral-300)] hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]"
                onClick={() => openField(activeSection.key, field.name)}
              >
                <i className={FIELD_TYPES.find((t) => t.value === field.type)?.icon ?? 'pi pi-circle'} style={{ fontSize: 13, opacity: 0.7 }} />
                <span className={layerLabel}>{field.label}</span>
                <span className={layerBadge}>{field.type}</span>
                <i className="pi pi-chevron-right" style={{ fontSize: 10, opacity: 0.6 }} />
              </button>
            ))}

            {addingFieldTo === activeSection.key ? (
              <div className="flex flex-col gap-1">
                <InputText
                  className={`${inputClass} w-full`}
                  placeholder="Field label"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  autoFocus
                />
                <Button label="Add field" size="small" disabled={!newFieldLabel.trim()} onClick={() => handleAddField(activeSection.key)} />
              </div>
            ) : (
              <Button
                icon="pi pi-plus"
                label="Add field"
                text
                size="small"
                className="!self-start"
                onClick={() => setAddingFieldTo(activeSection.key)}
              />
            )}
          </div>

          <Button
            icon="pi pi-trash"
            label="Delete section"
            severity="danger"
            outlined
            className="!w-full"
            onClick={() => {
              formEditor.removeSection(activeSection.key);
              setTab('form');
            }}
          />
        </>
      )}

      {tab === 'field' && activeSection && activeField && (
        <>
          <Breadcrumb parts={[config.title || 'Form', activeSection.title ?? activeSection.key, activeField.label]} />

          <div className="flex flex-col gap-1.5">
            <div className={sectionLabel}>Field</div>
            <div>
              <label className={fieldLabel}>Type</label>
              <Dropdown
                className={`${inputClass} w-full`}
                value={activeField.type}
                options={FIELD_TYPES}
                optionLabel="label"
                optionValue="value"
                itemTemplate={(t: (typeof FIELD_TYPES)[number]) => (
                  <span className="flex items-center gap-2">
                    <i className={t.icon} style={{ fontSize: 13 }} />
                    {t.label}
                  </span>
                )}
                valueTemplate={(t: (typeof FIELD_TYPES)[number] | undefined) =>
                  t ? (
                    <span className="flex items-center gap-2">
                      <i className={t.icon} style={{ fontSize: 13 }} />
                      {t.label}
                    </span>
                  ) : (
                    <span>Select...</span>
                  )
                }
                onChange={(e) => formEditor.updateField(activeSection.key, activeField.name, { type: e.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div>
              <label className={fieldLabel}>Label</label>
              <InputText
                className={`${inputClass} w-full`}
                value={activeField.label}
                onChange={(e) => formEditor.updateField(activeSection.key, activeField.name, { label: e.target.value })}
              />
            </div>
            <div className={fieldGrid}>
              <div>
                <label className={fieldLabel}>Name</label>
                <InputText className={`${inputClass} w-full`} value={activeField.name} disabled />
              </div>
              <div>
                <label className={fieldLabel}>Placeholder</label>
                <InputText
                  className={`${inputClass} w-full`}
                  value={activeField.placeholder ?? ''}
                  onChange={(e) =>
                    formEditor.updateField(activeSection.key, activeField.name, { placeholder: e.target.value || undefined })
                  }
                />
              </div>
            </div>
            <div>
              <label className={fieldLabel}>Helper text</label>
              <InputText
                className={`${inputClass} w-full`}
                placeholder="Shown under the control"
                value={activeField.helperText ?? ''}
                onChange={(e) =>
                  formEditor.updateField(activeSection.key, activeField.name, { helperText: e.target.value || undefined })
                }
              />
            </div>
          </div>

          {OPTION_TYPES.includes(activeField.type) && (
            <div>
              <label className={fieldLabel}>Options (label:value, comma-separated)</label>
              <InputText
                className={`${inputClass} w-full`}
                placeholder="Low:low, Medium:medium, High:high"
                defaultValue={formatOptions(Array.isArray(activeField.options) ? activeField.options : undefined)}
                onBlur={(e) => formEditor.updateField(activeSection.key, activeField.name, { options: parseOptions(e.target.value) })}
              />
            </div>
          )}

          {(activeField.type === 'number' || activeField.type === 'slider' || activeField.type === 'rating') && (
            <div className={fieldGrid}>
              <div>
                <label className={fieldLabel}>Min</label>
                <InputNumber
                  className={`${inputClass} w-full`}
                  value={activeField.min ?? null}
                  onValueChange={(e) => formEditor.updateField(activeSection.key, activeField.name, { min: e.value ?? undefined })}
                />
              </div>
              <div>
                <label className={fieldLabel}>Max</label>
                <InputNumber
                  className={`${inputClass} w-full`}
                  value={activeField.max ?? null}
                  onValueChange={(e) => formEditor.updateField(activeSection.key, activeField.name, { max: e.value ?? undefined })}
                />
              </div>
            </div>
          )}

          {activeField.type === 'textarea' && (
            <div>
              <label className={fieldLabel}>Rows</label>
              <InputNumber
                className={`${inputClass} w-full`}
                value={activeField.rows ?? null}
                min={1}
                max={20}
                onValueChange={(e) => formEditor.updateField(activeSection.key, activeField.name, { rows: e.value ?? undefined })}
              />
            </div>
          )}

          {activeField.type === 'file' && (
            <div className="flex flex-col gap-1.5">
              <div className={gapRow}>
                <span className="text-[11px] text-[var(--color-neutral-400)]">Multiple files</span>
                <InputSwitch
                  checked={Boolean(activeField.multiple)}
                  onChange={(e) => formEditor.updateField(activeSection.key, activeField.name, { multiple: Boolean(e.value) })}
                />
              </div>
              <div>
                <label className={fieldLabel}>Accept</label>
                <InputText
                  className={`${inputClass} w-full`}
                  placeholder=".pdf,.doc,.docx"
                  value={activeField.accept ?? ''}
                  onChange={(e) => formEditor.updateField(activeSection.key, activeField.name, { accept: e.target.value || undefined })}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <div className={sectionLabel}>Layout</div>
            <div>
              <label className={fieldLabel}>Column span</label>
              <SegmentedControl
                options={COL_SPAN_OPTIONS}
                value={activeField.colSpan ?? 1}
                onChange={(v) => formEditor.updateField(activeSection.key, activeField.name, { colSpan: v })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className={sectionLabel}>Validation</div>
            <div className={gapRow}>
              <span className="text-[11.5px] text-[var(--color-neutral-400)]">Required</span>
              <InputSwitch
                checked={typeof activeField.required === 'boolean' ? activeField.required : false}
                onChange={(e) => formEditor.updateField(activeSection.key, activeField.name, { required: Boolean(e.value) })}
              />
            </div>
            <div className={gapRow}>
              <span className="text-[11.5px] text-[var(--color-neutral-400)]">Disabled</span>
              <InputSwitch
                checked={typeof activeField.disabled === 'boolean' ? activeField.disabled : false}
                onChange={(e) => formEditor.updateField(activeSection.key, activeField.name, { disabled: Boolean(e.value) })}
              />
            </div>
          </div>

          <Button
            icon="pi pi-trash"
            label="Delete field"
            severity="danger"
            outlined
            className="!w-full"
            onClick={() => {
              formEditor.removeField(activeSection.key, activeField.name);
              setTab('section');
            }}
          />
        </>
      )}
    </div>
  );
}
