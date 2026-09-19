import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import type { StepperFormEditor } from '../hooks/useStepperFormEditor';
import type { DynamicFormField, FieldType } from './shared/DynamicForm';
import { chip, fieldGrid, fieldLabel, gapRow, inputClass, sectionLabel, tokenName, tokenRow } from '../styles/cn';

const FORM_MODE_OPTIONS = [
  { label: 'Add', value: 'add' },
  { label: 'Edit', value: 'edit' },
  { label: 'View', value: 'view' },
];

const FORM_SIZE_OPTIONS = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: undefined as unknown as string },
  { label: 'Large', value: 'large' },
];

const ORIENTATION_OPTIONS = [
  { label: 'Horizontal', value: 'horizontal' },
  { label: 'Vertical', value: 'vertical' },
];

const FIELD_TYPE_OPTIONS: { label: string; value: FieldType }[] = [
  { label: 'Text', value: 'text' },
  { label: 'Textarea', value: 'textarea' },
  { label: 'Number', value: 'number' },
  { label: 'Email', value: 'email' },
  { label: 'Dropdown', value: 'dropdown' },
  { label: 'Radio', value: 'radio' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Switch', value: 'switch' },
  { label: 'Date', value: 'date' },
];

const OPTION_TYPES: FieldType[] = ['dropdown', 'multiselect', 'radio'];

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

interface StepFieldRowProps {
  stepKey: string;
  field: DynamicFormField;
  editor: StepperFormEditor;
}

function StepFieldRow({ stepKey, field, editor }: StepFieldRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const staticOptions = Array.isArray(field.options) ? field.options : undefined;

  return (
    <div className="flex flex-col gap-1">
      <div className={`${tokenRow} flex-wrap`}>
        <span className={`${tokenName} flex-1`}>{field.label}</span>
        <button
          type="button"
          className={`${chip(typeof field.required === 'boolean' && field.required)} !text-[10px] !px-1.5 !py-1`}
          onClick={() => editor.updateField(stepKey, field.name, { required: !field.required })}
        >
          Required
        </button>
        <Button icon="pi pi-pencil" text size="small" className="!w-5 !h-5" onClick={() => setIsEditing((v) => !v)} />
        <Button
          icon="pi pi-trash"
          text
          size="small"
          severity="danger"
          className="!w-5 !h-5"
          onClick={() => editor.removeField(stepKey, field.name)}
        />
      </div>

      {isEditing && (
        <div className="flex flex-col gap-2 py-1.5 pl-2 border-l-2 border-[var(--color-divider)] ml-0.5">
          <div className={fieldGrid}>
            <div className="col-span-2">
              <label className={fieldLabel}>Label</label>
              <InputText
                className={`${inputClass} w-full`}
                value={field.label}
                onChange={(e) => editor.updateField(stepKey, field.name, { label: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className={fieldLabel}>Type</label>
              <Dropdown
                className={`${inputClass} w-full`}
                value={field.type}
                options={FIELD_TYPE_OPTIONS}
                onChange={(e) => editor.updateField(stepKey, field.name, { type: e.value })}
              />
            </div>
          </div>

          {OPTION_TYPES.includes(field.type) && (
            <div>
              <label className={fieldLabel}>Options (label:value, comma-separated)</label>
              <InputText
                className={`${inputClass} w-full`}
                placeholder="Starter:starter, Pro:pro"
                defaultValue={formatOptions(staticOptions)}
                onBlur={(e) => editor.updateField(stepKey, field.name, { options: parseOptions(e.target.value) })}
              />
            </div>
          )}

          <div className={gapRow}>
            <span className="text-[11px] text-[var(--color-neutral-400)]">Disabled</span>
            <InputSwitch
              checked={typeof field.disabled === 'boolean' ? field.disabled : false}
              onChange={(e) => editor.updateField(stepKey, field.name, { disabled: Boolean(e.value) })}
            />
          </div>

          <div>
            <label className={fieldLabel}>Helper text</label>
            <InputText
              className={`${inputClass} w-full`}
              value={field.helperText ?? ''}
              onChange={(e) => editor.updateField(stepKey, field.name, { helperText: e.target.value || undefined })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface StepperPropertiesProps {
  stepperEditor: StepperFormEditor;
}

export function StepperProperties({ stepperEditor }: StepperPropertiesProps) {
  const { config } = stepperEditor;
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [addingFieldTo, setAddingFieldTo] = useState<string | null>(null);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');

  if (!config) return null;

  const handleAddField = (stepKey: string) => {
    const label = newFieldLabel.trim();
    if (!label) return;
    stepperEditor.addField(stepKey, { name: slugify(label), label, type: newFieldType });
    setNewFieldLabel('');
    setNewFieldType('text');
    setAddingFieldTo(null);
  };

  return (
    <div className="flex-1 overflow-auto p-3 flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <div className={sectionLabel}>Form</div>
        <div className={fieldGrid}>
          <div>
            <label className={fieldLabel}>Mode</label>
            <Dropdown className={`${inputClass} w-full`} value={config.mode} options={FORM_MODE_OPTIONS} onChange={(e) => stepperEditor.setMode(e.value)} />
          </div>
          <div>
            <label className={fieldLabel}>Size</label>
            <Dropdown className={`${inputClass} w-full`} value={config.size} options={FORM_SIZE_OPTIONS} onChange={(e) => stepperEditor.setSize(e.value)} />
          </div>
          <div className="col-span-2">
            <label className={fieldLabel}>Orientation</label>
            <Dropdown
              className={`${inputClass} w-full`}
              value={config.orientation ?? 'horizontal'}
              options={ORIENTATION_OPTIONS}
              onChange={(e) => stepperEditor.setOrientation(e.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className={sectionLabel}>Flow</div>
        <div className={gapRow}>
          <span className="text-[11.5px] text-[var(--color-neutral-400)]">Linear</span>
          <InputSwitch checked={config.linear ?? true} onChange={(e) => stepperEditor.setLinear(Boolean(e.value))} />
        </div>
        <div className={gapRow}>
          <span className="text-[11.5px] text-[var(--color-neutral-400)]">Show cancel</span>
          <InputSwitch checked={config.showCancel ?? true} onChange={(e) => stepperEditor.setShowCancel(Boolean(e.value))} />
        </div>
        <div className={fieldGrid}>
          <div>
            <label className={fieldLabel}>Back label</label>
            <InputText className={`${inputClass} w-full`} value={config.backLabel ?? ''} onChange={(e) => stepperEditor.setBackLabel(e.target.value)} />
          </div>
          <div>
            <label className={fieldLabel}>Next label</label>
            <InputText className={`${inputClass} w-full`} value={config.nextLabel ?? ''} onChange={(e) => stepperEditor.setNextLabel(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={fieldLabel}>Finish label</label>
            <InputText className={`${inputClass} w-full`} value={config.finishLabel ?? ''} onChange={(e) => stepperEditor.setFinishLabel(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className={sectionLabel}>Steps</div>
          <Button icon="pi pi-plus" text size="small" className="!w-[22px] !h-[22px]" onClick={stepperEditor.addStep} />
        </div>

        {config.steps.map((step, index) => {
          const isEditingStep = editingStep === step.key;
          const isAddingField = addingFieldTo === step.key;
          const fields = step.sections.flatMap((s) => s.fields);
          const isActive = index === stepperEditor.activeStep;

          return (
            <div
              key={step.key}
              className="flex flex-col gap-1.5 p-2 rounded-sm bg-[var(--color-surface)]"
              style={{ boxShadow: isActive ? 'inset 0 0 0 1px var(--color-accent)' : undefined }}
              onClick={() => stepperEditor.setActiveStep(index)}
            >
              <div className={`${tokenRow} flex-wrap`}>
                <span
                  className="w-4 h-4 rounded-full grid place-items-center text-[9.5px] flex-none"
                  style={{
                    background: isActive ? 'var(--color-accent)' : 'var(--color-neutral-800)',
                    color: isActive ? 'var(--color-selected-tag-text)' : 'var(--color-neutral-400)',
                  }}
                >
                  {index + 1}
                </span>
                <span className={`${tokenName} flex-1`}>{step.label}</span>
                <Button
                  icon="pi pi-pencil"
                  text
                  size="small"
                  className="!w-5 !h-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingStep(isEditingStep ? null : step.key);
                  }}
                />
                <Button
                  icon="pi pi-trash"
                  text
                  size="small"
                  severity="danger"
                  className="!w-5 !h-5"
                  disabled={config.steps.length <= 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    stepperEditor.removeStep(step.key);
                  }}
                />
              </div>

              {isEditingStep && (
                <div className="pl-1">
                  <label className={fieldLabel}>Step label</label>
                  <InputText
                    className={`${inputClass} w-full`}
                    value={step.label}
                    onChange={(e) => stepperEditor.renameStep(step.key, e.target.value)}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1 pl-1">
                {fields.map((field) => (
                  <StepFieldRow key={field.name} stepKey={step.key} field={field} editor={stepperEditor} />
                ))}
              </div>

              {isAddingField ? (
                <div className="flex flex-col gap-1 pl-1" onClick={(e) => e.stopPropagation()}>
                  <InputText
                    className={`${inputClass} w-full`}
                    placeholder="Field label"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    autoFocus
                  />
                  <Dropdown
                    className={`${inputClass} w-full`}
                    value={newFieldType}
                    options={FIELD_TYPE_OPTIONS}
                    onChange={(e) => setNewFieldType(e.value)}
                  />
                  <Button label="Add field" size="small" disabled={!newFieldLabel.trim()} onClick={() => handleAddField(step.key)} />
                </div>
              ) : (
                <Button
                  icon="pi pi-plus"
                  label="Add field"
                  text
                  size="small"
                  className="!self-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddingFieldTo(step.key);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
